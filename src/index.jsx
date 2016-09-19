import React from 'react';

const styles = {
  line:{
    fill:"none",
    stroke: 'rgb(221, 226, 232)',
    strokeWidth:"2",
  },
  timeline:{
    fill:"none",
    stroke:"#354550",
    strokeWidth:"1",
  },
  phaseline:{
    fill:"none",
    stroke:"rgb(70, 94, 111)",
    strokeWidth:"1",
    stroke: 'rgb(221, 226, 232)',
    strokeDasharray: '5,5',
  },
  background:{
    fill: "rgb(40, 56, 68)",
  },
}

const height = 100;
const width = 100;


var EnvelopeGraph = React.createClass({

    propTypes: {
       a: React.PropTypes.number.isRequired,
       d: React.PropTypes.number.isRequired,
       s: React.PropTypes.number.isRequired,
       r: React.PropTypes.number.isRequired,

       style: React.PropTypes.object,
       lineStyle: React.PropTypes.object,
       timeLineStyle: React.PropTypes.object,
       phaseLineStyle: React.PropTypes.object,
    },


    /**
     * Returns the width of each phase
     * @return {Array} [attack_width, decay_width, sustain_width, release_width]
     */
    getPhaseLengths(){
        let total_time = this.props.a+this.props.d+this.props.r;

        //Percent of total envelope time (not counting sustain)
        let relative_a = this.props.a/total_time;
        let relative_d = this.props.d/total_time;
        let relative_r = this.props.r/total_time;

        //The sustain phase always has the same length
        let sustain_width = 10;
        let rem_width = width - sustain_width;

        //Distribute remaining width accoring to the relative lengths of each phase
        let absolute_a = relative_a*rem_width;
        let absolute_d = relative_d*rem_width;
        let absolute_r = relative_r*rem_width;

        return [absolute_a, absolute_d, sustain_width, absolute_r];
    },


    /**
     * Returns a string to be used as 'd' attribute on an svg path that resembles an envelope shape given its parameters
     * @return {String}
     */
    generatePath(){

        let [attack_width, decay_width, sustain_width, release_width] = this.getPhaseLengths();

        //Generate the svg path
        let strokes = [];
        strokes.push("M 0 " + height); //Start at the bottom

        strokes.push(this.linearStrokeTo(attack_width,-height));
        strokes.push(this.exponentialStrokeTo(decay_width,height*(1-this.props.s)));
        strokes.push(this.linearStrokeTo(sustain_width,0));
        strokes.push(this.exponentialStrokeTo(release_width,height*this.props.s));

        return strokes.join(" ");
    },

    /**
     * Constructs a command for an svg path that resembles an exponential curve
     * @param {Number} dx
     * @param {Number} dy
     * @return {String} command
     */
    exponentialStrokeTo(dx, dy){
        return ["c",
            dx/5,dy/2,
            dx/2,dy,
            dx,dy
        ].join(" ");
    },

    /**
     * Constructs a line command for an svg path
     * @param {Number} dx
     * @param {Number} dy
     * @return {String} command
     */
    linearStrokeTo(dx, dy){
        return "l " + dx + " " + dy;
    },


    render() {
        return (
            <svg style={this.props.style} viewBox={"0 0 100 100"} preserveAspectRatio="none">
                <rect width={width} height={height} style={styles.background} />
                {this.renderTimeLines()}
                <path  d={this.generatePath()} style={Object.assign({},styles.line,this.props.lineStyle)} vectorEffect="non-scaling-stroke"/>
                {this.renderPhaseLines()}
            </svg>
        );
    },

    /**
     * Renders a series of lines with exponentialy increasing distance between them
     */
    renderTimeLines(){
        var total_time = this.props.a + this.props.d + this.props.r;

        let loglines = [];
        for (var i = 1e-6; i < 100; i=i*Math.E) {
            if(i > total_time){
                break;
            }
            if(i/total_time>1e-2){
                loglines.push(
                    <line
                         key={i}
                         x1={i/total_time*width} y1="0" x2={i/total_time*width} y2={height}
                         style={Object.assign({},styles.timeline,this.props.timeLineStyle)}
                         vectorEffect="non-scaling-stroke"
                    />
                );
            }
        }

        return loglines;
    },

    /**
     * Renders a line between each phase
     */
    renderPhaseLines(){
        let widths = this.getPhaseLengths();

        let plines = [];
        let pos = 0;
        for (var i = 0; i < widths.length-1 ; i++) {
            pos += widths[i];
            plines.push(
                <line
                    key={i}
                    x1={pos} y1="0" x2={pos} y2={height}
                    style={Object.assign({},styles.phaseline,this.props.phaseLineStyle)}
                    vectorEffect="non-scaling-stroke"
                />
            );
        }

        return plines;
    },
});

export default EnvelopeGraph;
