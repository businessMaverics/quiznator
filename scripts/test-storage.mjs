import { setJson, getJson, deleteFile } from '../lib/storage.js';
import assert from 'assert';
import path from 'path';

async function runTest() {
    console.log("Running storage test...");

    const testFileName = 'test_quiz.json';
    const testData = {
        courseCode: 'TEST101',
        topic: 'Storage Verification',
        marks: 100,
        data: 'Some random data'
    };

    try {
        console.log("1. Testing setJson...");
        const url = await setJson(testFileName, testData);
        console.log(`Saved to: ${url}`);

        console.log("2. Testing getJson...");
        const retrievedData = await getJson(testFileName);
        console.log("Retrieved data:", retrievedData);

        assert.deepStrictEqual(retrievedData, testData, "Retrieved data does not match saved data");
        console.log("SUCCESS: Data matches.");

        console.log("3. Testing deleteFile...");
        await deleteFile(testFileName);

        const afterDelete = await getJson(testFileName);
        assert.strictEqual(afterDelete, null, "File should be gone after delete");
        console.log("SUCCESS: File deleted.");

    } catch (error) {
        console.error("TEST FAILED:", error);
        process.exit(1);
    }
}

runTest();
