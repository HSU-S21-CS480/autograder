import React, { Component } from 'react';
import { connect } from "react-redux";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class DescriptionComponent extends Component {

   constructor(props) {
      super(props);
   }

   render() {
      let desc = this.props.assignment.description; 

      if (desc === undefined || desc === null) {
         return (
            <div>
               <h6 style={{fontWeight: "bold"}}>No description given</h6>
            </div>
         ); 
      }
      else {
         return (
         <div style={{ textAlign: "left" }}>
               <SyntaxHighlighter
                  language="cpp"
                  style={vs}
                  showLineNumbers={true}
               >{desc}</SyntaxHighlighter>
         </div>
         );
      }
   }
}

const Description = connect(mapStateToProps)(DescriptionComponent);
export { Description };
export default Description;