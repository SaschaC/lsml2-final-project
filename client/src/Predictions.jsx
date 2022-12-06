import { useParams, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { makeStyles, fade } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import {
    Table,
    Typography,
    TableRow,
    TableHead,
    TableCell,
    TableBody,
    TableContainer,
    TableFooter,
    TablePagination,
    IconButton,
    Button,
    Input,
} from '@material-ui/core';
import { Clear, Search } from '@material-ui/icons';
import RefreshIcon from '@mui/icons-material/Refresh';
import { serverURL } from './config';
import  { Redirect } from 'react-router-dom'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { toast } from 'react-toastify';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';

const useStyles = makeStyles((theme) => {
    return ({
        drawer: {
            width: 240,
        },
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '10px',
        },
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            // padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            // ...theme.mixins.toolbar,
            justifyContent: "flex-end"
        },
        dashboardButton: {
            width: '100%',
            height: 50,
        },
        pageTitle: {
            marginLeft: 4,
            fontSize: 14,
            fontWeight: 500,
            width: '100%',
        },
        center: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },

        tableContainer: {
            marginTop: 10,
            width: '85%',
            // height: '85%',
            borderWidth: 1,
            borderColor: '#aaa',
            borderStyle: 'solid',
        },
        tableFilterArea: {
            marginTop: 15,
            marginBottom: 15,
            display: 'flex',
            justifyContent: 'flex-end'
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginLeft: 'auto',
            width: '200px',
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        deleteIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            paddingRight: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
        },
        tableRecord: {
            cursor: 'pointer',
            '&:hover': {
                background: '#ccc',
            }
        },
        tableCellText: {
            fontSize: 16,
            fontWeight: 700,
            color: '#000',
        },
        autoRefreshCheckbox: {
            opacity: 0.8,
            color: '#fff',
        },
        deleteForeverIcon: {
            color: 'red',
            cursor: 'pointer'
        },
        dialogButtonsWrapper: {
            width: '80%',
            height: '100px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: '10px',
            alignItems: 'center'
        },
        deleteButton: {
            background: 'red',
            color: 'white',
            width: '100px',
            height: '40px'
        },
        cancelButton: {
            background: 'blue',
            color: 'white',
            width: '100px',
            height: '40px'
        },
        deleteDialog: {
            padding: '10px',
        }
    })
});

const DeleteDialog = (props) => {
    const { onClose, selectedValue, open } = props;
    const classes = useStyles();
  
    const handleClose = () => {console.log('closing');}
  
    return (
      <Dialog classes={classes.deleteDialog} 
      PaperProps={{
        style: {
            padding: '10px',
            margin: '10px'
        }
      }}
      onClose={handleClose} open={open}
      >
        <DialogTitle style={{color: 'black', fontSize: '24pt', fontWeight: '800'}}>Delete Record</DialogTitle>
        <h5 style={{color: 'black', marginLeft: '10%', marginRight: '10%'}}>Are you sure you want to delete Patient: <b>{props.jobId}</b>??</h5>
        <div className={classes.dialogButtonsWrapper}>
            <Button
                className={classes.deleteButton}
                onClick={() => {
                    console.log('deleted', props.patientId, props.uniqueId);
                    let data = {};
                    axios.post(`${serverURL}/api/v1/delete_prediction/${props.jobId}`, data,
                    { headers: { 
                        'authorization': `Bearer ${localStorage.getItem('token')}` 
                    }})
                    .then(res => {
                        console.log('res', res);
                        toast.success(res.message);
                        props.onClose();
                    })
                    .catch(err => {
                        console.log('err', err);
                        toast.error(err.message || 'Something went wrong!');
                    })
                    .finally(() => {
                        props.onClose();
                    });                    
                }}
            >Delete</Button>
            <Button
                className={classes.cancelButton}
                onClick={() => {
                    console.log('cancelled');
                    props.onClose();
                }}
            >Cancel</Button>

        </div>
      </Dialog>
    );
  }

function TableRecord(props) {
    const { record, history, tableRecord } = props;
    const classes = useStyles();
    return (
        <TableRow
            className={tableRecord}
        >   
            <TableCell>
                {record.jobId}
            </TableCell>
            <TableCell>
                {record.fileName}
            </TableCell>
            <TableCell>
                {record.receivedAt}
            </TableCell>
            <TableCell>
                {record.predictedAt}
            </TableCell>
            <TableCell>
                {record.status}
            </TableCell>
            {/* <TableCell
                onClick={() => {
                    console.log('hiii')
                    if(record.status === 'Completed') {
                        history.push(`/prediction/${record.jobId}`);
                    }                    
                }}
            >
               {
                record.status === 'Completed' ? 
                <OpenInNewIcon />: null
               }
            </TableCell> */}
            <TableCell
                onClick={() => {
                    console.log('hiii')
                    if(record.status === 'Completed') {
                        // download file
                        axios.get(`${serverURL}/api/v1/prediction_download/${record.jobId}`, {
                            responseType: 'blob',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }).then(res => {
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'prediction.nii.gz');
                            document.body.appendChild(link);
                            link.click();

                        }).catch(err => {
                            console.log('err', err);
                        });
                    }
                }}
            >
               {
                record.status === 'Completed' ? 
                <DownloadIcon />: null
               }
            </TableCell>
            <TableCell
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <DeleteForeverIcon
                    className={classes.deleteForeverIcon}
                    onClick={(e) => {
                        console.log('Deleting....')
                        props.onDeleteClick();
                    }}
                    />
            </TableCell>
        </TableRow>
    );
}

export default function PredictionList(props) {

    const { model } = useParams();
    const history = useHistory();

    const [fetchedRecords, setFetchedRecords] = useState([]);
    const [activated, setActivated] = useState(false);
    const classes = useStyles();
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [textFilter, setTextFilter] = useState('');
    const [ notLoggedIn, setNotLoggedIn ] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteJobId, setDeleteJobId] = useState('');

    const getData = async () => {
        console.log("calling get data")
        try {
            const fetchedRecords = await axios.get(`${serverURL}/api/v1/jobs`, { headers: { 
                'authorization': `Bearer ${localStorage.getItem('token')}` 
            }});
            setFetchedRecords(fetchedRecords.data);
        } catch (err) {
            if (err.response.data.message === 'No token provided' || err.response.data.message === 'Invalid token provided.' || err.response.data.message === 'Token expired.') {
                // props.history.push('/login');
                console.log(err.response.data, 'err response');
                setNotLoggedIn(true);
            }
            if(err.response.data.message === "User not found") {
                history.push('/activate');
            }   
        }
    }

    useEffect(() => {
        getData();
    }, [activated]);

    useEffect(() => {
        onPageLoad();
    }, []);

    const onPageLoad = async () => {
       

    }

    const changeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value));
        setPage(0);
    }
    const changePage = (event, newPage) => {
        setPage(parseInt(newPage, 10));
    }
    const handleSearchChange = (event) => {
        setTextFilter(event.target.value);
    }

    // filter if any of the column matches the textFilter
    const filteredRecords = fetchedRecords.filter((record) => {
        for(let key in record) {
            if(record[key].toString().toLowerCase().includes(textFilter.toLowerCase())) {
                return true;
            }
        }
        return false;
    });

    const handleAutoRefresh = (e) => {
        console.log("event.target.checked", e.target.checked)
        if (e.target.checked) {
            console.log("enable auto refresh")
            const ri = setInterval(function() {
                getData();
            }, 1000 * 5)
            setRefreshInterval(ri)
        } else {
            console.log("disable auto refresh", refreshInterval)
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        }
    }

    if(notLoggedIn){
        return <Redirect to='/login'  />
    }
    
    return (
        <div className="root">

            <div>
                <Button
                    onClick={() => {
                        getData();
                    }}
                >
                    <RefreshIcon />
                </Button>
                <Tooltip title={<div style={{fontSize: "14px"}}>Enable auto refresh every 5 seconds</div>}>
                    <Checkbox color='white' onChange={handleAutoRefresh} defaultChecked={false} />
                </Tooltip>
                <Table stickyHeader>
                    <TableHead className='record-table-head'>
                        <TableRow>
                            <TableCell size='small'>
                                <Typography className={classes.tableCellText}>JobID</Typography>
                            </TableCell>
                            <TableCell size='small'>
                                <Typography className={classes.tableCellText}>FileName</Typography>
                            </TableCell>
                            <TableCell size='medium'>
                                <Typography className={classes.tableCellText}>ReceivedAt</Typography>
                            </TableCell>
                            <TableCell size='medium'>
                                <Typography className={classes.tableCellText}>PredictedAt</Typography>
                            </TableCell>
                            <TableCell size='medium'>
                                <Typography className={classes.tableCellText}>PredictionStatus</Typography>
                            </TableCell>
                            {/* <TableCell size="small">
                                <Typography className={classes.tableCellText}>Result</Typography>
                            </TableCell> */}
                            <TableCell size="small">
                                <Typography className={classes.tableCellText}>Download</Typography>
                            </TableCell>
                            <TableCell size='small'>
                                <Typography className={classes.tableCellText}>Delete</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRecords.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(record => (
                            <TableRecord
                                record={record}
                                tableRecord={classes.tableRecord}
                                history={history}
                                model={model}
                                onDeleteClick={() => {
                                    setDeleteDialogOpen(true);
                                    setDeleteJobId(record.jobId);
                                }}
                            
                            />
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={4}
                                count={filteredRecords.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                SelectProps={{
                                    inputProps: { 'aria-label': 'rows per page' },
                                    native: true,
                                }}
                                onChangePage={changePage}
                                onChangeRowsPerPage={changeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <DeleteDialog
                open={deleteDialogOpen}
                jobId={deleteJobId}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    getData();
                }}
            />
                
        </div>

    );
}