"use client";
import { useThreads } from '@liveblocks/react';
import React from 'react';
import { Composer, Thread } from "@liveblocks/react-ui";

function CommentBox() {
  const { threads } = useThreads();

  return (
    <div className="w-[300px] h-[200px] shadow-lg rounded-lg overflow-auto z-30 bg-white border border-gray-200">
      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-4">
        {threads?.map((thread) => (
          <Thread key={thread.id} thread={thread} className="mb-4" />
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0 z-40">
        <Composer className="relative">
          <Composer.Submit
            className="btn-primary absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Reply
          </Composer.Submit>
        </Composer>
      </div>
    </div>
  );
}

export default CommentBox;