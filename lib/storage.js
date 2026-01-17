import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'quizzes');

/**
 * Helper to ensure the data directory exists
 */
async function ensureDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

/**
 * Upload a file to local storage
 * Note: For a real app, you might want to save public assets to 'public/uploads'
 * For now, we keep everything in data/quizzes to match the request scope.
 */
export async function uploadFile(fileName, buffer, mimeType) {
    await ensureDir();
    console.log(`[Storage] Saving file locally: ${fileName}`);
    const filePath = path.join(DATA_DIR, fileName);

    try {
        await fs.writeFile(filePath, buffer);
        console.log(`[Storage] File saved: ${filePath}`);
        return fileName; // Returning filename as "url" for local context
    } catch (error) {
        console.error(`[Storage] Upload error for ${fileName}:`, error.message);
        throw error;
    }
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(fileName) {
    // Handle cases where full URL might be passed by stripping path
    const safeName = path.basename(fileName);
    console.log(`[Storage] Deleting locally: ${safeName}`);
    try {
        await fs.unlink(path.join(DATA_DIR, safeName));
    } catch (error) {
        console.warn(`[Storage] Delete warning for ${safeName}:`, error.message);
    }
}

/**
 * Save JSON data to local file
 */
export async function setJson(fileName, data) {
    await ensureDir();
    console.log(`[Storage] Saving JSON locally: ${fileName}`);
    const filePath = path.join(DATA_DIR, fileName);

    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`[Storage] JSON saved: ${filePath}`);
        return fileName;
    } catch (error) {
        console.error(`[Storage] Error saving JSON ${fileName}:`, error.message);
        throw error;
    }
}

/**
 * Retrieve JSON data from local file
 */
export async function getJson(fileName) {
    console.log(`[Storage] Reading JSON locally: ${fileName}`);
    const filePath = path.join(DATA_DIR, fileName);

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`[Storage] File not found: ${fileName}`);
            return null;
        }
        console.error(`[Storage] Error reading JSON ${fileName}:`, error.message);
        return null;
    }
}
