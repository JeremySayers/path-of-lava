import { useState } from 'preact/hooks';
import './style.css';
import { FileUploader } from "react-drag-drop-files";

interface FileUploadProps {
    hanldeFileTextLoaded: (fileText: string) => void;
    setLoading: (isLoading: boolean) => void;
}

export const FileUpload = (props: FileUploadProps) => {
    const [file, setFile] = useState(null);
    const fileTypes = ["TXT"];

    const handleChange = async (file) => {
        props.setLoading(true);
        setFile(file);
        props.hanldeFileTextLoaded(await file.text());
        props.setLoading(false);
    };

    return (
        <>
            <FileUploader handleChange={handleChange} name="file" types={fileTypes} multiple={false} />
            <p>{file ? `Client.txt loaded` : "Upload above"}</p>
        </>
    );
}