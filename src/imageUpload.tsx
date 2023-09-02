import { useState, useCallback } from 'preact/hooks';
import './styles/style.css';
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
    hanldeImageLoaded: (imageData: any) => void;
    setLoading: (isLoading: boolean) => void;
}

export function ImageUpload(props: ImageUploadProps) {
    const [fileLoaded, setFileLoaded] = useState(false);
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                const imageData = reader.result;
                props.hanldeImageLoaded(imageData);
                props.setLoading(false);
                setFileLoaded(true);
            }
            props.setLoading(true);
            reader.readAsDataURL(file)
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
            {!fileLoaded && <div>Upload a screenshot of your atlas (G by default in game).</div>}
        </div>
    )
}