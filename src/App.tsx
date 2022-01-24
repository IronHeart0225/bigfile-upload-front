import React, { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import 'react-dropzone-uploader/dist/styles.css';
import Dropzone from "react-dropzone-uploader";
import './App.css';

const App: React.FC = () => {
  let totalsize = 0;
  let currentsize = 0;
  const [filesToUpload, setFilesToUpload] = useState([] as FileToUpload[]);
  const [progress, setProgress] = useState(0);

  const DrophandleSubmit = (files: any, allFiles: any) => {
    let filesToUpload: FileToUpload[] = [];
    totalsize = 0;
    currentsize = 0;
    setProgress(0);
    for (let i = 0; i < allFiles.length; i++) {
        totalsize += allFiles[i].file.size;
      filesToUpload.push(new FileToUpload(allFiles[i].file, allFiles[i].file.name));
    }

    setProgress(1);
    for (let i = 0; i < filesToUpload.length; i++) {
      filesToUpload[i].uploadFile();
    }
  }

  class FileToUpload {
    //static chunkSize = 100000000;  // 100 Mb 
    static chunkSize = 256000000;  // 256 Mb

    static uploadUrl = 'http://localhost:5001/upload';
    readonly request: XMLHttpRequest;
    readonly file: File;
    currentChunkStartByte: number;
    currentChunkFinalByte: number;
    chunkindex: number;

    constructor(file: File, name: string) {
      this.request = new XMLHttpRequest();
      this.request.overrideMimeType('application/octet-stream');

      this.file = file;
      this.currentChunkStartByte = 0;
      this.currentChunkFinalByte = FileToUpload.chunkSize > this.file.size ? this.file.size : FileToUpload.chunkSize;
      this.chunkindex = 1;
    }

    uploadFile() {
      this.request.open('POST', FileToUpload.uploadUrl, true);

      let chunk: Blob = this.file.slice(this.currentChunkStartByte, this.currentChunkFinalByte);
      this.request.setRequestHeader('Content-Range', `bytes ${this.currentChunkStartByte}-${this.currentChunkFinalByte}/${this.file.size}`);

      this.request.onload = () => {
        const remainingBytes = this.file.size - this.currentChunkFinalByte;
        currentsize += FileToUpload.chunkSize;
        if (currentsize > totalsize) currentsize = totalsize;
        // console.log(currentsize, totalsize, "percentage");
        setProgress(Math.round((currentsize * 100) / totalsize));
        if (this.currentChunkFinalByte === this.file.size) {
          return;
        } else if (remainingBytes < FileToUpload.chunkSize) {
          this.currentChunkStartByte = this.currentChunkFinalByte;
          this.currentChunkFinalByte = this.currentChunkStartByte + remainingBytes;
        }
        else {
          this.currentChunkStartByte = this.currentChunkFinalByte;
          this.currentChunkFinalByte = this.currentChunkStartByte + FileToUpload.chunkSize;
        }

        this.uploadFile();
      }

      const formData = new FormData();
      formData.append('file', chunk, this.file.name);
      formData.append('chunkindex', (this.chunkindex++).toString());
      formData.append('chunkbyteoffset', this.currentChunkStartByte.toString());
      formData.append('totalchunkcount', Math.ceil(this.file.size / FileToUpload.chunkSize).toString());
      formData.append('totalfilesize', this.file.size.toString());
      this.request.send(formData);
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: FileList | null = e.target.files;
    if (!files) return;
    let filesToUpload: FileToUpload[] = [];
    totalsize = 0;
    currentsize = 0;
    setProgress(0);
    for (let i = 0; i < files.length; i++) {
        totalsize += files[i].size;
        filesToUpload.push(new FileToUpload(files[i], files[i].name));
    }

    setFilesToUpload(filesToUpload);
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProgress(1);
    for (let i = 0; i < filesToUpload.length; i++) {
      filesToUpload[i].uploadFile();
    }
  };

  return (
    <div className="App">
      <h2 className="upload-title my-4">File Uploader</h2>
      <div className="upload-form">
        <form id="file_upload" onSubmit={onFormSubmit} className="d-none">
          <div className="upload-file-select">
            <label htmlFor="file_1">Select files for upload</label>
            <input id="file_1" type="file" multiple onChange={onFileChange} />
          </div>
          <div className="upload-file-list">
            {filesToUpload.map((f, i) => <div className="upload-file" key={i}>{f.file.name} - {f.file.size}bytes</div>)}
          </div>
          <div className="upload-submit">
            <input type="submit" value="submit" />
          </div>
          <div className='mt-3' />
        </form>
        <div className='mx-auto mt-4' style={{ maxWidth: "600px", maxHeight: "800px"}}>
          {progress !== 0 && <ProgressBar animated now={progress} label={`${progress}%`} />}
            <Dropzone
            multiple
            accept="*"
            onSubmit={DrophandleSubmit}
            maxFiles={3}
            inputContent="Drop 3 Files"
            inputWithFilesContent={files => `${3 - files.length} more`}
            submitButtonDisabled={files => files.length < 3}
            />
        </div>
      </div>
    </div>
  )
}

export default App;
