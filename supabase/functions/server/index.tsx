import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
async function initializeStorage() {
  const bucketName = "make-a423d57b-items";
  
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      console.log(`Created bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error(`Error initializing storage: ${error}`);
  }
}

// Initialize on startup
initializeStorage();

// Helper function to verify user authentication
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return { error: "No authorization header", user: null };
  }
  
  const token = authHeader.split(" ")[1];
  if (!token) {
    return { error: "Invalid authorization header", user: null };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: "Unauthorized", user: null };
  }
  
  return { error: null, user };
}

// Health check endpoint
app.get("/make-server-a423d57b/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Sign up endpoint
app.post("/make-server-a423d57b/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true,
    });
    
    if (error) {
      console.error(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.error(`Signup exception: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// ==================== ITEM ROUTES ====================

// Get all items
app.get("/make-server-a423d57b/items", async (c) => {
  try {
    const items = await kv.getByPrefix("item:");
    
    // Generate signed URLs for images
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        if (item.images && item.images.length > 0) {
          const signedUrls = await Promise.all(
            item.images.map(async (imagePath: string) => {
              const { data } = await supabase.storage
                .from("make-a423d57b-items")
                .createSignedUrl(imagePath, 3600); // 1 hour expiry
              return data?.signedUrl || "";
            })
          );
          return { ...item, imageUrls: signedUrls };
        }
        return item;
      })
    );
    
    return c.json({ items: itemsWithImages });
  } catch (error) {
    console.error(`Error fetching items: ${error}`);
    return c.json({ error: "Failed to fetch items" }, 500);
  }
});

// Get single item
app.get("/make-server-a423d57b/items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`item:${id}`);
    
    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    // Generate signed URLs for images
    if (item.images && item.images.length > 0) {
      const signedUrls = await Promise.all(
        item.images.map(async (imagePath: string) => {
          const { data } = await supabase.storage
            .from("make-a423d57b-items")
            .createSignedUrl(imagePath, 3600);
          return data?.signedUrl || "";
        })
      );
      item.imageUrls = signedUrls;
    }
    
    return c.json({ item });
  } catch (error) {
    console.error(`Error fetching item: ${error}`);
    return c.json({ error: "Failed to fetch item" }, 500);
  }
});

// Create new item (requires auth)
app.post("/make-server-a423d57b/items", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const itemData = await c.req.json();
    const itemId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const item = {
      id: itemId,
      ...itemData,
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.name || user.email,
      status: "Available",
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`item:${itemId}`, item);
    
    return c.json({ item });
  } catch (error) {
    console.error(`Error creating item: ${error}`);
    return c.json({ error: "Failed to create item" }, 500);
  }
});

// Update item status (requires auth)
app.put("/make-server-a423d57b/items/:id", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existingItem = await kv.get(`item:${id}`);
    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    const updatedItem = {
      ...existingItem,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`item:${id}`, updatedItem);
    
    return c.json({ item: updatedItem });
  } catch (error) {
    console.error(`Error updating item: ${error}`);
    return c.json({ error: "Failed to update item" }, 500);
  }
});

// Delete item (requires auth)
app.delete("/make-server-a423d57b/items/:id", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const id = c.req.param("id");
    const item = await kv.get(`item:${id}`);
    
    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    // Only allow deletion by the item owner
    if (item.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }
    
    // Delete images from storage
    if (item.images && item.images.length > 0) {
      await supabase.storage
        .from("make-a423d57b-items")
        .remove(item.images);
    }
    
    await kv.del(`item:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error deleting item: ${error}`);
    return c.json({ error: "Failed to delete item" }, 500);
  }
});

// Upload image (requires auth)
app.post("/make-server-a423d57b/upload", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("make-a423d57b-items")
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error(`Upload error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ path: data.path });
  } catch (error) {
    console.error(`Upload exception: ${error}`);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// ==================== CLAIM ROUTES ====================

// Create a claim (requires auth)
app.post("/make-server-a423d57b/claims", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { itemId, message } = await c.req.json();
    const claimId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const claim = {
      id: claimId,
      itemId,
      claimerId: user.id,
      claimerEmail: user.email,
      claimerName: user.user_metadata?.name || user.email,
      message,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`claim:${claimId}`, claim);
    
    // Update item status to Pending
    const item = await kv.get(`item:${itemId}`);
    if (item) {
      item.status = "Pending";
      item.claimId = claimId;
      await kv.set(`item:${itemId}`, item);
    }
    
    return c.json({ claim });
  } catch (error) {
    console.error(`Error creating claim: ${error}`);
    return c.json({ error: "Failed to create claim" }, 500);
  }
});

// Get user's claims (requires auth)
app.get("/make-server-a423d57b/claims", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const allClaims = await kv.getByPrefix("claim:");
    const userClaims = allClaims.filter(claim => claim.claimerId === user.id);
    
    return c.json({ claims: userClaims });
  } catch (error) {
    console.error(`Error fetching claims: ${error}`);
    return c.json({ error: "Failed to fetch claims" }, 500);
  }
});

// ==================== MESSAGE ROUTES ====================

// Send a message (requires auth)
app.post("/make-server-a423d57b/messages", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { recipientId, itemId, content } = await c.req.json();
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const message = {
      id: messageId,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email,
      recipientId,
      itemId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    await kv.set(`message:${messageId}`, message);
    
    return c.json({ message });
  } catch (error) {
    console.error(`Error sending message: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Get user's messages (requires auth)
app.get("/make-server-a423d57b/messages", async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.header("Authorization"));
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const allMessages = await kv.getByPrefix("message:");
    const userMessages = allMessages.filter(
      msg => msg.senderId === user.id || msg.recipientId === user.id
    );
    
    return c.json({ messages: userMessages });
  } catch (error) {
    console.error(`Error fetching messages: ${error}`);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

Deno.serve(app.fetch);