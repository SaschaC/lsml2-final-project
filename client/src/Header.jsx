import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';

import axios from 'axios';

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '50px',
        backgroundColor: '#aa44ba',
        color: 'white',
        padding: '0 20px'
    },
    sidebar: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '200px',
        height: '100vh',
        backgroundColor: '#aa44ba',
        zIndex: 1000,
        padding: '20px',
        color: 'white',
    },
    sidebarOptions: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '20px',
    }
}

const Sidebar = (props) => {
    if(!props.open) {
        return null;
    }
    return (
        <div style={styles.sidebar}>
            <Button onClick={props.onMenuToggle}>
                <MenuIcon />
            </Button>
            <div style={styles.sidebarOptions}>
                <Button 
                    style={{color: 'white'}}
                    onClick={() => props.history.push('/home')}>
                    Home
                </Button>
                <Button 
                    style={{color: 'white'}}
                    onClick={() => props.history.push('/upload')}>
                    New Prediction
                </Button>
                <Button 
                    style={{color: 'white'}}
                    onClick={() => {
                    localStorage.removeItem('token');
                    props.history.push('/login');
                }}>
                    Logout
                </Button>
            </div>
           
        </div>
    );
}

const Header = (props) => {
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect( () => {
 
  },[]);

  const onLogout = () => {
    localStorage.removeItem("token");
    history.push("/login");
  }
  const onMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
    }
  // dashboard
    return(
        <header style={styles.header}>
            <Button onClick={onMenuToggle}>
                <MenuIcon />
            </Button>
            <div style={{width: '90%'}}>
                {props.page}
            </div>
            <div>
                <Button 
                onClick={onLogout}
                style={{color: 'white'}}
                >Logout</Button>
            </div>
            <Sidebar open={sidebarOpen} onMenuToggle={onMenuToggle} history={history} />
        </header>
    );
}

export default Header;