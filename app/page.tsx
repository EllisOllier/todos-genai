import Image from "next/image";
import { GoogleGenAI } from "@google/genai";

type Priority = "High" | "Medium" | "Low";
interface TodoItem {
    id: number;
    task: string;
    completed: boolean;
    priority: Priority;
    dueDate: string;
}

type TodoList = TodoItem[];

export default async function Home() {
    const todoList = await generateTodo();

    return (
        <div className="">
            <h1>My Todos: </h1>
            <ul>
                {todoList.map((item) => (
                    <li key={item.id}>Task: {item.task} | Priority: {item.priority} | Due Date: {item.dueDate} | Completed: {item.completed}</li>
                ))}
            </ul>
        </div>
    );
}

// app/page.tsx (Updated generateTodo function)

async function generateTodo(): Promise<TodoList> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents:
            "Generate 10 todo points as an array of JSON objects with keys: id (number), task (string), completed (boolean), priority (string), and dueDate (string).",
        config: {
            // **This is the key setting for clean JSON output**
            responseMimeType: "application/json",
            // Optional: You can try increasing temperature slightly to encourage simpler output, though not strictly required
            // temperature: 0.1, 
        },
    });

    const text = response.text ?? "";
    console.log("--- RAW GEMINI RESPONSE ---");
    console.log(text);
    console.log("---------------------------");

    try {
        // Attempt to parse the text
        const parsedData = JSON.parse(text);

        // Optional: Add a check to ensure it's an array and not an empty object
        if (Array.isArray(parsedData)) {
            // Type assertion (as TodoList) is safe here since we control the prompt
            return parsedData as TodoList; 
        } else {
            // Handle cases where the output might be valid JSON but not an array
            console.error("Parsed data is not an array:", parsedData);
            return [];
        }

    } catch (error) {
        // Log the error and the problematic text for debugging
        console.error("JSON Parsing Failed. Check the RAW GEMINI RESPONSE above for errors.", error);
        
        // **Return an empty array as a safe fallback**
        return []; 
    }
}
