// wrapper for the page
import * as React from 'react';
import Header from './Header';



export default function Home(props) {

    return (
        <div>
        <Header 
            page={props.page}
        />
        {props.children}
        </div>
    );
    
}