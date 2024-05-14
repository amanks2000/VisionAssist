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
  const [data, setData] = useState<any | null>(null);
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
      // 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
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
          // If rate limited,2ount of time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
          retries++;
        } else {
          break;
        }
      } while (retries < maxRetries);

      if (response && response.ok) {
        const data1 = await response.arrayBuffer();
        // setData(data1); 
        const blob = new Blob([data1], { type: "audio/mpeg" });
        const audioUrl1 = URL.createObjectURL(blob);
    
        setAudioUrl(audioUrl1);
        // console.log('audioURL: ', audioUrl, data);
        
      } else {
        throw new Error("Failed to fetch audio data");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
};

// useEffect(() => {
//   console.log('audioURL:', audioUrl, data);
// }, [audioUrl, data]);

  
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
