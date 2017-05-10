import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from '../CustomPropTypes';

const styles = {
    wrapper: {
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        background: '#000',
    },
    list: {
        margin: '0 auto',
        width: '25%',
        position: 'relative',
        listStyle: 'none',
    },
    item: {
        margin: '2em 0',
    },
    link: {
        color: '#fff',
        display: 'block',
        textDecoration: 'none',
        border: '1px solid #fff',
        padding: '1em',
        textAlign: 'center',
    },
};

export default class BoardOverview extends Component {

    static propTypes = {
        boards: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            slug: PropTypes.string,
        })),
    }

    static defaultProps = {
        boards: [],
    }

    render() {
        return (
            <div style={styles.wrapper}>
                <ul style={styles.list}>
                    {this.props.boards.map(({ name, slug }) => (
                        <li key={slug} style={styles.item}>
                            <Link to={`/${slug}`} style={styles.link}>{name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}
