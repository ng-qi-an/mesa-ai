'use client';

import { useState, useRef, useEffect } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { quizSchema } from '@/app/api/quiz/schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { File as FileIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import z from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

export default function Chat() {
  const [files, setFiles] = useState<File[]>([]);
  const [fineTune, setFineTune] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { object, submit, isLoading, error, stop, clear } = useObject({
    api: '/api/quiz',
    schema: z.array(quizSchema),
    fetch: async (url, options) => {
      const formData = new FormData();
      formData.append('fineTune', fineTune);
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      return fetch(url, {
        method: 'POST',
        body: formData,
      });
    },
  });

  useEffect(()=>{
    console.log(object)
  }, [object])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="flex flex-col w-full h-full p-4">
        {(object && object.length > 0) ?
        <>
            <div className='flex items-center mt-4'>
                <h2 className='text-base font-medium'>Generated {object.length} Quiz Questions</h2>
                <Button variant="default" disabled={isLoading} size='sm' className='ml-auto' onClick={()=>{
                    clear()
                    setFineTune('')
                    setFiles([])
                }}>Generate new</Button>
            </div>
            <div className='grid md:grid-cols-2 xl:grid-cols-3 w-full gap-4 mt-4'>
                {object.map((item, index) => {
                    if (item){
                        return <Card key={index} className='w-full'>
                            <CardHeader>
                                <CardTitle className='text-lg font-medium'>{`Q${index + 1}: ${item.question}`}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {item.type === 'mcq' && item.options ? (
                                    <ul className='list-disc list-inside'>
                                        {item.options.map((option, optIndex) => (
                                            <li key={optIndex} className={option === item.answer ? 'font-semibold text-green-600' : ''}>
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className='font-semibold text-green-600'>Answer: {item.answer}</p>
                                )}
                                <p className='mt-2 italic text-sm text-muted-foreground'>Hint: {item.hint}</p>
                            </CardContent>
                        </Card>
                    }
                })}
                {isLoading && <Skeleton className='h-full'>
                </Skeleton>}
            </div>
        </>
        : <p>Not generated yet</p>
        }
        <div className='flex-1'/>
        {(!object || object.length === 0) && (
        <form
            className='flex flex-col pb-6 w-full max-w-md mx-auto'
            onSubmit={handleSubmit}
        >
            <Card className="w-full rounded-md" size='sm'>
                <CardHeader>
                    <CardTitle>Materials</CardTitle>
                    <CardDescription>
                        Files to generate quiz questions from.
                    </CardDescription>
                    <CardAction className='w-max'>
                        <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className='absolute opacity-0 pointer-events-none w-20'
                        />
                        <Button variant="secondaryRaised" type='button' size={'sm'} onClick={() => fileInputRef.current?.click()}>Add file</Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {files.length > 0 ? (
                        <div className='flex flex-col gap-2'>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center">
                                    <FileIcon className='size-4 mr-3 text-muted-foreground'/>
                                    <span className="truncate">{file.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className='ml-auto text-muted-foreground'
                                        onClick={() => removeFile(index)}
                                    >
                                        <X />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : <p className='font-medium text-center w-full py-4'>No materials uploaded</p>}
                </CardContent>
            </Card>
            <Label htmlFor="fineTune" className="mt-5 mb-4">Fine-tune (optional)</Label>
            <Textarea 
                value={fineTune}
                id="fineTune"
                onChange={(e) => setFineTune(e.target.value)}
                placeholder="Emphasise on a specific concept..."
            />
            <Button disabled={isLoading} size={'lg'} variant={'raised'} className='mt-6'>{isLoading ? <Spinner/> : "Generate"}</Button>
        </form>
        )}
    </div>
  );
}