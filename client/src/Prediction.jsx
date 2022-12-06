import * as React from 'react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import { ColorPicker } from 'material-ui-color';
import axios from 'axios';
import Button from '@mui/material/Button';
import { PNG } from 'pngjs/browser';
import Slider from '@material-ui/core/Slider';
import request from 'request';
import { serverURL } from './config';
import { Grid, Typography } from '@mui/material';
import  { Redirect, useParams } from 'react-router-dom'
import Box from '@material-ui/core/Box';


const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '100%',
        paddingBottom: '50px',
        // background: '#0e0e0e',
    },
    modal: {
        flex: '4',
        background: '#0e0e0e',
        opacity: 1,
        padding: '10px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        borderRadius: '5px',
    },
    csvLink: {
        marginTop: '20px',
        background: '#83f',
        color: '#fff',
    },
    root: {
        flexWrap: 'wrap',
        // justifyContent: 'space-around',
        // alignItems: 'center',
        // flexDirection: 'column',
        padding: '10px',
        height: '100%',
    },
    image_grid: {
        width: '100%',
        height: '100%',
        display: 'grid',
        margin: '10px',
        gridRowGap: '10px',
        gridColumnGap: '10px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))'
    },
    image: {
        maxWidth: '360px',
    },
    imageWrapper: {
        background: 'url("/app/assets/loading_spinner.gif") center center no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    imagesWrapper: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))',
        gridRowGap: '10px',
        gridColumnGap: '10px',
    },
    buttonVisible: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'stretch',
        alignItems: 'center',
        margin: '10px',
        width: '100%'
    },
    buttonInvisible: {
        display: 'none'
    },
    imageCanvas: {
        maxWidth: '90%'
    },
    canvasWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    displayOptions: {
        flex: '1',
        display: 'flex',
        padding: '10px',
        flexDirection: 'column',
        background: '#ffffffc2',
        height: '74vh',
        overflow: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #00000045',
        borderRadius: '5px',
        marginRight: '20px',
    },
    buttonsWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    modelViewSelect: {
        minWidth: '150px',
        minHeight: '400px',
    },
    modalViewSelectPlane: {
        backgroundColor: "white",
        width: "134px",
        position: "relative",
        left: "-283px",
    },
    lobeOption: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '30px',
        justifyContent: 'space-between',
        margin: '5px',
        minWidth: '40px',
        width: '100%',
        padding: '5px',
        alignItems: 'center'
    },
    lobeOptionText: (color) => {
        return {
            color: color,
            fontSize: '1.2em',
            paddingRight: '5px',
            flexGrow: 4
        }
    },
    windowOptions: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'center'
    },
    windowOptionsRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '10px'
    },
    buttonStyle: {
        marginTop: '15px',
        flex: 1,
        margin: '10px',
        // opacity: 0.5,
        background: '#2C5364',//#78ffd6',
        color: 'white',
        border: '1px solid #2C5364',
        '&:hover': {
            opacity: 0.8,
            cursor: 'pointer',
        },
        width: '100%',
        maxWidth: '200px',
        maxHeight: '40px',
    },
    planeButtons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        minWidth: '200px',
        minHeight: '50px',
        alignItems: 'center',
        width: '70%',
    },
    planeButton: (checked) => {
        return {
            flex: 1,
            margin: '10px',
            opacity: 0.8,
            background: checked ? '#2C5364' : '#eee',
            color: checked ? 'white' : 'black',
            border: '1px solid #2C5364',
            '&:hover': {
                opacity: 0.8,
                cursor: 'pointer',
            },
            minWidth: '50px',
        }
    },
    planesWrapper: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '50px',
        maxWidth: '300px',
    },
    canvasDownloadWrapper: {
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'end',
        alignItems: 'center',
        margin: '0 10px',
        width: '100%'
    },
    slicesSelect: {
        marginTop: '10px',
        maxHeight: '30px',
        marginLeft: '10px',
        width: '100%',
        maxWidth: '200px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    sliceRangeSelect: {
        flex: 1,
        minWidth: '100px',
        marginLeft: '20px',
    },
    lobesVisibility: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        maxHeight: '400px',
        padding: '0',
        overflow: 'hidden',
        // scrollbarWidth: 'none'
    },
    lobesVisibilityLabels: {
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        width: '95%',
    },
    allLobesVisibility: {
        fontSize: '14pt',
        fontWeight: '500',
        color: '#2C5364',
    },
    ctss: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center'
    },
    ctssTable: {
        width: '50%',
        height: '50%',
        background: '#fff',
        opacity: 1,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        margin: '0',
        padding: '0',
        top: '50%',
        left: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        borderRadius: '5px',
        minHeight: '100px',
        display: 'flex',
        boxShadow: '0 0 10px rgb(0,0,0)'
    },
    ctssRow: {
        maxHeight: '40px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'stretch',
        alignItems: 'center',
        // border: '3px solid #000',
        // borderRadius: '2px',

    },
    ctssTd: {
        // border: '1px solid #000',
        minWidth: '20px',
        maxHeight: '30px',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        width: '66px',
        border: '2px solid #eee',
        borderRight: 'none',
        paddingLeft: '5px',
    },
    scrollButton: {
        height: '100%',
    },
    filetypeButton: (checked) => {
        return {
            flex: 1,
            margin: '10px',
            opacity: 0.8,
            background: checked ? '#2C5364' : '#eee',
            color: checked ? 'white' : 'black',
            border: '1px solid #2C5364',
            '&:hover': {
                opacity: 0.8,
                cursor: 'pointer',
            },
            minWidth: '100px',
            maxWidth: '300px',
        }
    },
    progress: {
        height: '30px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    labelsDownloadWrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minWidth: '200px',
        maxWidth: '300px',
        border: '1px solid #000',
        borderRadius: '5px',
        padding: '10px',
        height: '100%',
        background: '#fff',
        marginLeft: '20px'
    },
    downloadModelSelect: {
        marginTop: '30px',
    },
    downloadButtonsWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    }

}

const colorArrayToHexString = (colorArray) => {

    return '#' + colorArray.map(x => {
        return ('0' + x.toString(16)).slice(-2);
    }).join('');
}

const Windowing = (props) => {
    let wlRef = React.createRef();
    let wwRef = React.createRef();
    return (
        <div style={styles.windowOptions}>
            <div style={styles.windowOptionsRow}>
                <TextField
                    sx={{ width: '100%' }}
                    inputRef={wlRef}
                    id="wl-number"
                    label="WL"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="standard"
                />
            </div>
            <div style={styles.windowOptionsRow}>
                <TextField
                    sx={{ width: '100%' }}
                    inputRef={wwRef}
                    id="ww-number"
                    label="WW"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="standard"
                />
            </div>
            <div style={styles.windowOptionsRow}>
                {/* <button type="button"  className="btn btn-primary" data-toggle="modal" data-target="#split-img-modal">
                Launch demo modal
            </button> */}
                <Button style={styles.buttonStyle}
                    onClick={() => {
                        const wl = parseInt(wlRef.current.value) || 0;
                        const ww = parseInt(wwRef.current.value) || 1000;
                        props.onChangeWindow(wl, ww);
                    }}
                    >
                    Change Window
                </Button>

            </div>

        </div>

    );
}

const VisibilityEye = (props) => {
    const [visible, setVisible] = React.useState(props.visible);
    
    React.useEffect(() => {
        setVisible(props.visible);
      }, [props.visible]);
    if (visible) {
        return <VisibilityIcon
            key={props.key}
            onClick={
                () => {
                    setVisible(false);
                    props.onVisibilityChange(props.name, false);
                }
            } />
    } else {
        return <VisibilityOffIcon
            key={props.key}
            onClick={
                () => {
                    setVisible(true);
                    props.onVisibilityChange(props.name, true);
                }
            } />
    }
}

const CTImage = (props) => {
    const [fetched, setFetched] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [imageData3D, setImageData3D] = React.useState(null);
    const [numLoaded, setNumLoaded] = React.useState(0);
    const [imagesFetchedList, setImagesFetchedList] = React.useState({});
    const [plane, setPlane] = React.useState('axial');
    const [numImages, setNumImages] = React.useState(155);
    const [imgSize, setImgSize] = React.useState([240, 240]);
    const [labelsLoaded, setLabelsLoaded] = React.useState(false);
    const [labelsImages, setLabelsImages] = React.useState([]);

    let axialImgRef = null;
    let coronalImgRef = null;
    let sagittalImgRef = null;

    const planes = [
        'axial',
        'coronal',
        'sagittal'
    ];
    const [switchLabelsState, setSwitchLabelsState] = React.useState({});
    const [labelsColors, setLabelsColors] = React.useState({});
    const [labelsOpacity, setLabelsOpacity] = React.useState(0.4);
    const size = 512;


    const [windowVals, setWindowVals] = React.useState([300, 600]);

    const window = (val, wl, ww) => {
        val = val - 8192;
        const ll = wl - ww / 2;
        const ul = wl + ww / 2;
        if (val < ll)
            val = ll;
        else if (val > ul)
            val = ul;
        return (val - ll) / (ul - ll) * 255;
    }

    const drawOverlays = (imageData, imgSize, numImages, selectedImage) => {
        if (imageData == null)
            return;
        // get new canvas
        let canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // const ctx = canvasRef?.getContext('2d');
        // let width = imgSize;
        let overlaidImageData;
        if (plane === 'axial' || numLoaded < numImages) {
            overlaidImageData = new Uint8Array(imgSize[0] * imgSize[1] * 4);
        } else if (plane === 'coronal') {
            overlaidImageData = new Uint8Array(numImages * imgSize[1] * 4);
        } else {
            overlaidImageData = new Uint8Array(numImages * imgSize[0] * 4);
        }

        const updateLabels = (overlaidImageData, labelIndex, imgIndex) => {
            // for (let model of props.models) {
            //     let labelVal = labelsImages[model][labelIndex];

            //     if (labelVal < 1 || !(labelVal in labelToVals[model]) || switchLabelsState[model][labelToVals[model][labelVal]] === false) {
            //         continue;
            //     }
            //     let color = labelsColors[model][labelToVals[model][labelVal]];
            //     overlaidImageData[imgIndex] = overlaidImageData[imgIndex] * (1. - labelsOpacity) + color[0] * labelsOpacity;
            //     overlaidImageData[imgIndex + 1] = overlaidImageData[imgIndex + 1] * (1. - labelsOpacity) + color[1] * labelsOpacity;
            //     overlaidImageData[imgIndex + 2] = overlaidImageData[imgIndex + 2] * (1. - labelsOpacity) + color[2] * labelsOpacity;
            // }
            return overlaidImageData;
        }
 
//axial        
        {
            const offset = selectedImage * imgSize[0] * imgSize[1] * 4;
            for (let i = 0; i < imgSize[0] * imgSize[0]; i++) {
                let index = i * 4;
                let val = imageData[offset + index + 2] + imageData[offset + index + 1] * 256;
                val = window(val, windowVals[0], windowVals[1]);
                overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                overlaidImageData[index + 3] = 255;
                overlaidImageData = updateLabels(overlaidImageData, offset + index, index);
            }
            let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[1], imgSize[0]);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.putImageData(img, 0, 0);
            axialImgRef = canvas.toDataURL('image/jpeg', 0.99);
        }
        
// coronal
        {
            for (let i = 0; i < numImages; i++) {
                for (let j = 0; j < imgSize[1]; j++) {
                    let offset = (i * imgSize[0] * imgSize[1] + j + imgSize[1] * selectedImage) * 4;
                    let val = imageData[offset + 2] + imageData[offset + 1] * 256;
                    val = window(val, windowVals[0], windowVals[1]);
                    let index = (i * imgSize[1] + j) * 4;
                    overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                    overlaidImageData[index + 3] = 255;
                    overlaidImageData = updateLabels(overlaidImageData, offset, index);
                }
            }

            let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[1], numImages);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.putImageData(img, 0, 0);
            coronalImgRef = canvas.toDataURL('image/jpeg', 0.99);
        }

// sagittal
        {
            for (let i = 0; i < numImages; i++) {
                for (let j = 0; j < imgSize[0]; j++) {
                    let offset = (i * imgSize[0] * imgSize[1] + j * imgSize[1] + selectedImage) * 4;
                    let val = imageData[offset + 2] + imageData[offset + 1] * 256;
                    val = window(val, windowVals[0], windowVals[1]);
                    let index = (i * imgSize[0] + j) * 4;
                    overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                    overlaidImageData[index + 3] = 255;
                    overlaidImageData = updateLabels(overlaidImageData, offset, index);
                }
            }
            let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[0], numImages);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.putImageData(img, 0, 0);
            sagittalImgRef = canvas.toDataURL('image/jpeg', 0.99);
        }
    

        setLoaded(true);
    }


    const setImages = (images) => {
    }

    const handleWheel = (e, plane) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            const val = Math.min(selectedImage[plane] + 1, numImages);
            setPlane(plane);
            setSelectedImage({ ...selectedImage, [plane]: val });
        }
        else {
            const val = Math.max(selectedImage[plane] - 1, 0);
            setPlane(plane);
            setSelectedImage({ ...selectedImage, [plane]: val });
        }
    }


    React.useEffect(() => {
        console.log('fetching!!!', props.images);

        const asyncFetch = async () => {
            for (let i = 0; i < props.images.length; i++) {
                let imgType = props.images[i].image_type;
                let imgName = props.images[i].image_name;
                console.log(props.images[i], 'fetching!!!', imgType);
                request({
                    url: `${serverURL}/${props.images[i].image_url}`,
                    encoding: null,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }, function (err, res, body) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        new PNG().parse(body, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                if(imgType === 'input') {
                                    setImages(images => ({
                                        ...images,
                                        [imgName]: data.data
                                    }));
                                } else {
                                    setLabelsImages(labelsImages => ({
                                        ...labelsImages,
                                        [i]: data.data
                                    }));
                                }
                            }
                        });
                        setNumLoaded(numLoaded => numLoaded + 1);
                    }
                    if (i === props.images.length - 1) {
                        setLabelsLoaded(true);
                    }
                });
            }
        }
        asyncFetch();
    }, []);

    React.useEffect(() => {
        if (numLoaded === props.images.length) {
            // setImageData3D(new Uint8Array(props.imgSize * props.imgSize * props.images.length * 4));
            // let newData = new Uint8Array(props.imgSize[0] * props.imgSize[1] * props.images.length * 4);
            // for (let j = 0; j < Object.keys(imagesFetchedList).length; j++) {
            //     newData.set(imagesFetchedList[j], j * props.imgSize[0] * props.imgSize[1] * 4);
            // }
            // setImageData3D(newData);
            // for(let i = 0; i < props.images.length; i++) {
            //     if(props.images[i].image_type === 'input') {
            //         let newData = new Uint8Array(props.imgSize[0] * props.imgSize[1] * props.numImages * 4);
            //         for(let j = 0; j < props.numImages; j++) {
            //             newData.set(images[props.images[i].image_name], j * props.imgSize[0] * props.imgSize[1] * 4);
            //         }
            //         setImageData3D(newData);
            //     }
            // }
        }
    }, [numLoaded, imagesFetchedList]);

    React.useEffect(() => {
        const asyncDraw = async () => {
            if (numLoaded >= props.images.length) {

                drawOverlays(imageData3D, props.imgSize, props.images.length, selectedImage);
                setFetched(true);
            }
            else if (imagesFetchedList[selectedImage]) {
                drawOverlays(imagesFetchedList[selectedImage], props.imgSize, props.images.length, selectedImage);
                setFetched(true);
            }
        }
        asyncDraw();
    }, [switchLabelsState, labelsColors, labelsOpacity, windowVals, fetched, selectedImage]);

    if(loaded){
        return(
            <div style={styles.imagesWrapper}>
            <div style={styles.imgWrapper}>
                <img id="myImg" ref={node => { axialImgRef = node }} width={512} height={512} style={styles.img} 
                    onWheel={(e) => {
                     handleWheel(e, 'axial');
                    }}
                    />
                <Slider style={styles.slider} value={selectedImage['axial']} min={0} max={numImages - 1} onChange={(e, val) => {
                    setPlane('axial');
                    setSelectedImage({ ...selectedImage, 'axial': val });
                }} />
            </div>
            <div style={styles.imgWrapper}>
                <img id="myImg" ref={node => { coronalImgRef = node }} width={512} height={512} 
                       onWheel={(e) => {
                            handleWheel(e, 'coronal');
                        }}
                
                />
                <Slider style={styles.slider} value={selectedImage['coronal']} min={0} max={imgSize[0]} onChange={(e, val) => { 
                    setPlane('coronal');
                    setSelectedImage({ ...selectedImage, 'coronal': val });
                }} />
            </div>
            <div style={styles.imgWrapper}>
                <img id="myImg" ref={node => { sagittalImgRef = node }} width={512} height={512} 
                    onWheel={(e) => {
                        handleWheel(e, 'sagittal');
                    }}
                                   />
                <Slider style={styles.slider} value={selectedImage['sagittal']} min={0} max={imgSize[1]} onChange={(e, val) => {
                    setPlane('sagittal');
                    setSelectedImage({ ...selectedImage, 'sagittal': val });
                }} />
            </div>
        </div>
        );
             }else{
                return (
            <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                    // value={ (( numDownloaded + numLoaded) / 2) / numImages * 100 }
                    // variant="indeterminate"
                    color="primary"
                    size={50}
                >
                    </CircularProgress>
                      <Box
                        sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        }}
                    >
                        {/* <Typography
                        variant="caption"
                        component="div"
                        color="white"
                        >{`${Math.round((( numDownloaded + numLoaded) / 2) / numImages * 100)}%`}</Typography> */}
                    </Box>
                </Box>
        </div>
    );
    }
}

export default function Prediction() {
    const [fetched, setFetched] = React.useState(false);
    const [data, setData] = React.useState({});
    // get params from url
    const { jobId } = useParams();

    React.useEffect(() => {
        const fetchData = async () => {
            axios.get(`${serverURL}/api/v1/prediction/${jobId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }).then(res => {
                let data = res.data;
                console.log(data, 'before delete');
                setData(data);
                setFetched(true);
            });
        }
        if (!fetched)
            fetchData();
    }, [fetched]);

    return (
        <div style={
            styles.root
        }>
            {
                fetched ?
                    <CTImage
                        open={true}
                        jobId={jobId}
                        images={data['images']}
                        imgSize={data['img_size']}
                        numImages={155}
                        onClick={(e) => {

                        }}
                    /> : <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}>
                        <CircularProgress />
                        <p>Loading...</p>
                    </div>
            }
       </div>
    );
}
