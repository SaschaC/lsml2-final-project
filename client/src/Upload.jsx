import * as React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { LinearProgress } from '@material-ui/core';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import { Typography } from '@mui/material';
import  { Redirect } from 'react-router-dom'
import { serverURL } from './config';
import { useHistory } from "react-router-dom";
import {useParams} from 'react-router-dom';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'transparent',
    },
    inferenceButton: {
        margin: '10px',
        maxWidth: '300px',
        minWidth: '200px',
        width: '100%',
        height: '50px',
        backgroundColor: '#2C5364',
        alignItems: 'center',
        borderRadius: "50px",
        color: 'white',
        marginTop: "25px",
        marginLeft: "24px",
    },
    filetypeButton: (checked) => {
        return {
            flex: 1,
            marginBottom: '10px',
            opacity: 0.8,
            background: checked ? '#2C5364' : '#a6a6a6',
            color: checked ? 'white' : 'white',
            minWidth: '100px',
            maxWidth: '300px',
            width: '100%',
            zIndex: 9999,
            backgroundColor: '#2C5364',
            borderRadius: "50px",
        }
    },
    fileTypesWrapper: {
        minWidth: '400px',
        width: '80%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    planesWrapper: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '50px',
        maxWidth: '300px',
    },
    modelCheckbox: {
        margin: '10px',
        opacity: 0.8,
        /* background: '#eee',
        border: '1px solid #00e',*/
        color: '#fff',
        alignItems: 'center',
    },
    modal: {
        width: '300px',
        height: '300px',
        backgroundColor: '#49494b',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        justifyContent: 'space-around',
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        top: '50%',
        left: '50%',
        border: '1px solid #002233',
        bordeRadius: '5px'

    },
  
   
    modalHeader: {
        display: 'flex',
        width: '100%',
        height: '20px',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    closeIcon: {
        margin: '10px',
        cursor: 'pointer',
        color: 'white',
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        
    },
    predictionWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    wrapper: {
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '20px',
    },
    container: {
        width: '80%',
        minHeight: '600px',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: '10px',
        border: '1px solid #002233',
    },
    selectFileWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        
    },
    // styles the file input
    fileUpload: {
        display: 'none',
    },
    // styles the button that is used to upload the file
    fileUploadButton: {
        width: '100px',
        height: '100px',
        backgroundColor: '#2C5364',
        alignItems: 'center',
        borderRadius: "50px",
        color: 'white',
        marginTop: "25px",
        marginLeft: "24px",
        cursor: 'pointer',
    },
    uploadWrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    }
}

const FileUploadProgress = (props) => {
    let history = useHistory();
    const fileRefNii = React.useRef(null);
    const fileRefZip = React.useRef(null);
    const [progress, setProgress] = React.useState(0);
    const [isUploading, setIsUploading] = React.useState(false);
    return (
        <form className='nii-form' style={{ zIndex: 9999 }} onSubmit={
            (e) => {
                e.preventDefault();
                setIsUploading(true);
                const req = new XMLHttpRequest();
                req.open(props.method, props.url);
                req.setRequestHeader('authorization', 'Bearer ' + localStorage.getItem('token'));
                req.onload = () => {
                    setIsUploading(false);
                    setProgress(0);
                    props.onComplete(JSON.parse(req.response));
                }
                req.upload.onprogress = (e) => {
                    setProgress(Math.round(e.loaded / e.total * 100));
                }
                req.onabortion = () => {
                }
                req.onerror = () => {
                    console.log('error');
                }

                const formData = new FormData();

                if (props.fileType === 'nii') {
                    formData.append('fileType', 'nii');
                    for (let i = 0; i < fileRefNii.current.files.length; i++) {
                        formData.append('files', fileRefNii.current.files[i]);
                    }
                } else {
                    formData.append('fileType', 'dcm');
                    
                    formData.append('zip_file', fileRefZip.current.files[0]);
                }
                req.send(formData);
            }
        }>
            <div style={styles.uploadWrapper}>
                <div className='col-12' style={{ marginTop: "15px" }}>
                    {
                        props.fileType === 'nii' ?
                                    <div style={styles.fileUploadButton} onClick={() => fileRefNii.current.click()}>
                                        <input type="file" name="file" onChange={props.onChange} ref={fileRefNii}  multiple accept=".nii.gz,.nii" style={styles.fileUpload} />
                                        <FileUploadIcon 
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                color: 'white',
                                                marginTop: "25px",
                                                marginLeft: "25px",
                                            }}
                                        />
                                    </div>:
                                    <div style={styles.fileUploadButton}>
                                        <input type="file" name="file" onChange={props.onChange} ref={fileRefZip} accept=".zip" style={styles.fileUpload} />
                                        <FileUploadIcon 
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                color: 'white',
                                                marginTop: "25px",
                                                marginLeft: "25px",
                                            }}
                                        />
                                    </div>
                    }

                </div>
                <div className='col-12'>
                    <div className='upld-prog-wrap' style={{ marginTop: "15px" }}>
                        <Button
                            className='nii-btn'
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={styles.inferenceButton}
                            disabled={isUploading}
                        >Upload
                        </Button>


                        {isUploading ?
                            <div className='progres-wrap' style={styles.progress}>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                />
                                {progress} %
                            </div> : null}
                    </div>

                </div>
            </div>




        </form>
    );
}


const NiiImage = (props) => {
    return (
        <FileUploadProgress
            url={`${serverURL}/api/v1/upload`}
            fileType={'nii'}
            method={'POST'}
            onProgress={(e) => console.log(e)}
            onComplete={(e) => {
                if (e.status === true && e.message === 'File successfully uploaded') {
                    props.onUploaded(true, e.id.patient_id, e.id.unique_id);
                }
            }}
            style={styles.filetypeButton(props.checked)}
        />
    );
}



const DcmImage = (props) => {
    return (
        <FileUploadProgress
            url={`${serverURL}/api/v1/upload`}
            fileType={'dcm'}
            method={'POST'}
            onProgress={(e) => console.log(e)}
            onComplete={(e) => {
                if (e.status === true && e.message === 'File successfully uploaded') {
                    props.onUploaded(true, e.id.patient_id, e.id.unique_id);
                }
            }}
        />
    );
}



const Models = (props) => {
    return (
        <div style={styles.models}>
            <h5 className='subslct-heading'>MODEL SELECTION</h5>
            <FormControl className='chk-wrap'>
                <FormGroup className='chk-grp-wrap check-grp'>
                    {
                        props.models.map((model, index) => {
                            return (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            name='model'
                                            checked={props.checked}
                                            onChange={props.onChange}
                                            value={model}
                                            style={styles.modelCheckbox}
                                        />
                                    }
                                    label={model}
                                />
                            );
                        })
                    }
                </FormGroup>
            </FormControl>
        </div>
    );
}

export default function PredictionNew(props) {
    

    const params = useParams();
    const [imageType, setImageType] = React.useState('nii');
    const [uploaded, setUploaded] = React.useState(params.uniqueId ? true : false);
    const [patientId, setPatientId] = React.useState(params.patientId); // React.useState('002_S_5018'); //React.useState(null);
    const [uniqueId, setUniqueId] = React.useState(params.uniqueId); //React.useState('bf7da4e77b8b420a90fd0c528f3a3fbe'); // React.useState(null);
    const [inferenceStarted, setInferenceStarted] = React.useState(false);
    const [preprocessStarted, setPreprocessStarted] = React.useState(params.uniqueId ? true : false);
    const [preprocessDone, setPreprocessDone] = React.useState(false);
    const [preprocessStatus, setPreprocessStatus] = React.useState('');
    const [accessKey, setAccessKey] = React.useState('');
    const [numImages, setNumImages ] = React.useState(170); //React.useState(170);
    const [retry, setRetry] = React.useState(0);
    const [artefactModel, setArtefactModel] = React.useState('');//React.useState('');
    const [models, setModels] = React.useState([]);
    const [artefactModels, setArtefactModels] = React.useState([]);
    const [imgSize, setImgSize] = React.useState([0, 0]);
    const [preprocessModalOpen, setPreprocessModalOpen] = React.useState(params.uniqueId ? true: false);

    const [ notLoggedIn, setNotLoggedIn ] = React.useState(false);

    console.log('preprocessdone', preprocessDone);

   
    React.useEffect(() => {
       
    }, []);

    // Submit for Inference
    const onSubmitForInference = () => {
        const data = {
            fileType: imageType,
            models: models.filter((model, index) => {
                return document.getElementsByName('model')[index].checked;
            }).join(','),
            patientId: patientId,
            uniqueId: uniqueId
        };
        const inferenceURL = `${serverURL}/api/v1/inference`;
        axios.post(inferenceURL, data,
            { headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } }
        ).then((res) => {
            if (res.status === 200) {
                setInferenceStarted(true);
            }
        }).catch((err) => {
            console.log(err);
            if (err.response.data.message === 'No token provided' || err.response.data.message === 'Invalid token provided.' || err.response.data.message === 'Token expired.') {
                // props.history.push('/login');
                console.log(err.response.data, 'err response');
                // return <Redirect to='/login'  />
                // history.push('/login');
                setNotLoggedIn(true);
            }
            if (err.response.data.message === 'User not activated' || err.response.data.message === 'User not found') {
                // props.history.push('/activate');
                console.log(err.response.data, 'err response');

            }
        });

    }
    if(notLoggedIn){
        return <Redirect to='/login'  />
    }
    return (
            <div style={styles.wrapper}>
                <div style={styles.container}>
                <div style={styles.selectFileWrapper}>
                <Button
                    className='nii-btn'
                    style={styles.filetypeButton(imageType === 'nii' ? true : false)}
                    onClick={() => setImageType('nii')}
                >
                    NII Images
                </Button>
                <Button
                    className='nii-btn'
                    style={styles.filetypeButton(imageType === 'dcm' ? true : false)}
                    onClick={() => setImageType('dcm')}
                >
                    ZIP of NII Images
                </Button>

            </div>
            {imageType === 'nii' ?
                <NiiImage
                    onUploaded={(val, patientId, uniqueId) => {
                        setPatientId(patientId);
                        setUniqueId(uniqueId);
                        setUploaded(val);
                        setPreprocessDone(false);
                        setPreprocessStarted(false);
                    }}
                />
                : <DcmImage
                    onUploaded={(val, patientId, uniqueId) => {
                        setPatientId(patientId);
                        setUniqueId(uniqueId);
                        setUploaded(val);
                        setPreprocessDone(false);
                        setPreprocessStarted(false);
                    }}
                />}
         
            </div>
            <Modal
                open={inferenceStarted}
            >
                <div
                    style={styles.modal}
                >
                    <h1>Inference Started</h1>
                    <Typography>
                        You can check the inference status for uniqueId {uniqueId} in the prediction records page
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        href={'/prediction/records'}
                    >Go to Predictions</Button>
                </div>
            </Modal>
     

        </div>
    );
}