"use client";
import CoverPicker from "@/app/_components/CoverPicker";
import EmojiPickerComponent from "@/app/_components/EmojiPickerComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/config/firebaseConfig";
import { useAuth, useUser } from "@clerk/nextjs";
import { doc, setDoc } from "firebase/firestore";
import { Loader2Icon, SmilePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import uuid4 from "uuid4";

function CreateWorkspace() {
  const [coverImage, setCoverImage] = useState("/cover.png");
  const [workspaceName, setWorkspaceName] = useState("");
  const [emoji, setEmoji] = useState(null);
  const { user } = useUser();
  const { orgId } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Used to create a new workspace and save data in Firestore
   */
  const OnCreateWorkspace = async () => {
    try {
      setLoading(true);

      // Generate unique workspace ID
      const workspaceId = Date.now().toString();

      // Validate required fields and fallback for undefined values
      const createdBy = user?.primaryEmailAddress?.emailAddress || "unknown";
      const organizationId = orgId || createdBy;

      // Create workspace document
      const workspaceData = {
        workspaceName: workspaceName || "Untitled Workspace",
        emoji: emoji || "🌟",
        coverImage: coverImage || "/default-cover.png",
        createdBy,
        id: workspaceId,
        orgId: organizationId,
      };

      await setDoc(doc(db, "Workspace", workspaceId), workspaceData);

      // Create initial document in the workspace
      const docId = uuid4();
      const documentData = {
        workspaceId,
        createdBy,
        coverImage: null,
        emoji: null,
        id: docId,
        documentName: "Untitled Document",
        documentOutput: [],
      };

      await setDoc(doc(db, "workspaceDocuments", docId), documentData);

      // Create document output
      const documentOutputData = {
        docId,
        output: [],
      };

      await setDoc(doc(db, "documentOutput", docId), documentOutputData);

      setLoading(false);
      router.replace(`/workspace/${workspaceId}/${docId}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      setLoading(false);
      alert("Failed to create workspace. Please try again.");
    }
  };

  return (
    <div className="p-10 md:px-36 lg:px-64 xl:px-96 py-28">
      <div className="shadow-2xl rounded-xl">
        {/* Cover Image */}
        <CoverPicker setNewCover={(v) => setCoverImage(v)}>
          <div className="relative group cursor-pointer">
            <h2
              className="hidden absolute p-4 w-full h-full
              items-center group-hover:flex justify-center"
            >
              Change Cover
            </h2>
            <div className="group-hover:opacity-40">
              <Image
                src={coverImage}
                width={400}
                height={400}
                className="w-full h-[180px] object-cover rounded-t-xl"
                alt="Workspace Cover"
              />
            </div>
          </div>
        </CoverPicker>

        {/* Input Section */}
        <div className="p-12">
          <h2 className="font-medium text-xl">Create a new workspace</h2>
          <h2 className="text-sm mt-2">
            This is a shared space where you can collaborate with your team. You
            can always rename it later.
          </h2>
          <div className="mt-8 flex gap-2 items-center">
            <EmojiPickerComponent setEmojiIcon={(v) => setEmoji(v)}>
              <Button variant="outline">
                {emoji ? emoji : <SmilePlus />}
              </Button>
            </EmojiPickerComponent>
            <Input
              placeholder="Workspace Name"
              onChange={(e) => setWorkspaceName(e.target.value)}
              value={workspaceName}
            />
          </div>
          <div className="mt-7 flex justify-end gap-6">
            <Button
              disabled={!workspaceName?.length || loading}
              onClick={OnCreateWorkspace}
            >
              Create {loading && <Loader2Icon className="animate-spin ml-2" />}
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateWorkspace;
