import { useState, useCallback } from 'preact/hooks';
import './style.css';
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
    hanldeFileTextLoaded: (fileText: string) => void;
    setLoading: (isLoading: boolean) => void;
}

export function FileUpload(props: FileUploadProps) {
    const [fileLoaded, setFileLoaded] = useState(false);
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                const fileText = reader.result as string;
                props.hanldeFileTextLoaded(fileText);
                props.setLoading(false);
                setFileLoaded(true);
            }
            props.setLoading(true);
            reader.readAsText(file)
        })

    }, [])
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: undefined,
        onDragEnter: undefined,
        onDragOver: undefined,
        onDragLeave: undefined,
        useFsAccessApi: false
    })

    return (
        <div style={{ 'width': '100%' }} {...getRootProps()}>
            <input {...getInputProps()} type="file" />
            {fileLoaded ? <p>Client.txt loaded, click or drag to reupload.</p>
                : <p>Drag 'n' drop some files here, or click to select files</p>}
        </div>
    )
}