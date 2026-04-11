import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, StickyNote, Trash2, Save } from "lucide-react";
import { useState } from "react";

export interface BookmarkItem {
  id: string;
  page_number: number;
  label: string | null;
}

export interface NoteItem {
  id: string;
  page_number: number;
  content: string;
}

interface PdfSidebarProps {
  bookmarks: BookmarkItem[];
  notes: NoteItem[];
  currentPage: number;
  currentNote: string;
  onGoToPage: (page: number) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSaveNote: (page: number, content: string) => void;
  onCurrentNoteChange: (val: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const PdfSidebar = ({
  bookmarks,
  notes,
  currentPage,
  currentNote,
  onGoToPage,
  onDeleteBookmark,
  onDeleteNote,
  onSaveNote,
  onCurrentNoteChange,
  activeTab,
  onTabChange,
}: PdfSidebarProps) => {
  return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-card">
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex h-full flex-col">
        <TabsList className="mx-2 mt-2 grid w-auto grid-cols-2">
          <TabsTrigger value="bookmarks" className="text-xs">
            <Bookmark className="mr-1 h-3 w-3" /> Bookmarks
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            <StickyNote className="mr-1 h-3 w-3" /> Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="flex-1 overflow-hidden px-2">
          <ScrollArea className="h-full">
            {bookmarks.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No bookmarks yet. Click the bookmark icon to save a page.</p>
            ) : (
              <div className="space-y-1 py-2">
                {bookmarks
                  .sort((a, b) => a.page_number - b.page_number)
                  .map((bm) => (
                    <div
                      key={bm.id}
                      className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      <button
                        className="flex-1 text-left text-sm text-foreground"
                        onClick={() => onGoToPage(bm.page_number)}
                      >
                        Page {bm.page_number}
                        {bm.label && <span className="ml-1 text-xs text-muted-foreground">– {bm.label}</span>}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => onDeleteBookmark(bm.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="flex flex-1 flex-col overflow-hidden px-2">
          <div className="mb-2 space-y-2">
            <p className="text-xs text-muted-foreground">Note for page {currentPage}:</p>
            <Textarea
              placeholder="Write your note here..."
              value={currentNote}
              onChange={(e) => onCurrentNoteChange(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <Button
              size="sm"
              className="w-full"
              onClick={() => onSaveNote(currentPage, currentNote)}
              disabled={!currentNote.trim()}
            >
              <Save className="mr-1 h-3 w-3" /> Save Note
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {notes.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No notes yet.</p>
            ) : (
              <div className="space-y-2 py-2">
                {notes
                  .sort((a, b) => a.page_number - b.page_number)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="group rounded-md border border-border p-2"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          className="text-xs font-medium text-primary"
                          onClick={() => onGoToPage(note.page_number)}
                        >
                          Page {note.page_number}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100"
                          onClick={() => onDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-foreground">{note.content}</p>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PdfSidebar;
