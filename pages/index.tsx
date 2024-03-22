import Head from "next/head";
import Yolo from "../components/models/Yolo";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

export interface CreateSoundRequest {
  modelUrl: string;
  text: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  /**
   * Handles the process of fetching audio data using the provided request.
   * @param {CreateSoundRequest} request - The request containing model URL and text.
   */
  const handleGetAudio = async (request: CreateSoundRequest) => {
    console.log('inside handleGetAudio');
    setIsLoading(true);
  
    try {
      if (!request.modelUrl) {
        throw new Error("Missing 'model url' field in the request");
      }
  
      if (!request.text) {
        throw new Error("Missing 'text' field in the request");
      }
  
      const modelUrl = request.modelUrl;
      const input = request.text;

      let retries = 0;
      const maxRetries = 3;
      let response;

      do {
        response = await fetch(modelUrl, {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: input }),
        });

        if (response.status === 429) {
          // If rate limited, wait for a certain amount of time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
          retries++;
        } else {
          break;
        }
      } while (retries < maxRetries);

      if (response && response.ok) {
        const data = await response.arrayBuffer();
  
        const blob = new Blob([data], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(blob);
    
        setAudioUrl(audioUrl);
      } else {
        throw new Error("Failed to fetch audio data");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
};

  
  return (
    <>
      <main className="font-mono flex flex-col justify-center items-center  w-screen bg">
        <h1 className="m-5 text-xl font-bold">VisionAssist: Real-Time Object Detection</h1>
        <Yolo handleGetAudio={handleGetAudio} />
        <>
          {audioUrl && (
            <audio controls autoPlay>
              <source id="audioSource" type="audio/flac" src={audioUrl!} />
            </audio>
          )}
        </>
      </main>
    </>
  );
}
