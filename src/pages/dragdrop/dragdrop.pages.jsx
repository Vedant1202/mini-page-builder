/** @format */

import React, { Component } from 'react';
import './dragdrop.styles.scss';

import { Modal, Input, Space } from 'antd';

import { AppstoreOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { selectCurrentSavedState } from '../../redux/saved-state/saved-state.selector';
import { setCurrentSavedState } from '../../redux/saved-state/saved-state.actions';

class DragDropPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [
                {
                    key: 'label',
                    name: 'This is a Label',
                    category: 'wip',
                    positionx: null,
                    positiony: null,
                    type: 'label',
                },
                {
                    key: 'input',
                    name: 'This is an Input',
                    category: 'wip',
                    positionx: null,
                    positiony: null,
                    type: 'input',
                },
                {
                    key: 'button',
                    name: 'This is a Button',
                    category: 'wip',
                    positionx: null,
                    positiony: null,
                    type: 'button',
                },
            ],
            placed: [],
            inputValues: [],
            counter: 0,
            modalVisible: false,
            modalName: '',
            modalFontSize: '',
            modalFontWeight: '',
            tempEvent: null,
            draggedDivId: '',
            draggedDivRepeat: '',
            toShowModal: false,
            modalX: '',
            modalY: '',
        };
    }

    // When component mounts, retrieve the previous stored redux data and set the state
    componentDidMount = () => {
        const { savedState } = this.props;
        if (this.props.savedState) {
            this.setState({
                ...savedState,
            });
        }
    };

    // Function to show modal
    showModal = e => {
        const { toShowModal, draggedDivRepeat } = this.state;
        const modalVisible = toShowModal ? true : false;
        const modalX = e.pageX;
        const modalY = e.pageY;

        this.setState(
            {
                tempEvent: e,
                modalVisible,
                modalX,
                modalY,
            },
            () => {
                if (draggedDivRepeat) {
                    this.onDrop(e, 'complete');
                }
            }
        );
    };

    // Handle 'OK' click of modal
    handleOk = () => {
        const { modalName, modalFontSize, modalFontWeight, tempEvent } = this.state;

        if (modalName.trim() !== '' && String(modalFontSize).trim() !== '' && String(modalFontWeight) !== '') {
            this.setState(
                {
                    modalVisible: false,
                    modalName,
                    modalFontSize,
                    modalFontWeight,
                    tempEvent: null,
                },
                () => {
                    this.onDrop(tempEvent, 'complete');
                }
            );
        } else {
            alert('Please fill in all the details');
        }
    };

    // Handle closing of modal
    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };

    // Handling the start action of dragging an element
    // The variable 'repeat' indicates if a new component is being added or
    // if the same component is being dragged to a new place.
    onDragStart = (ev, id, repeat = false) => {
        const toShowModal = repeat ? false : true;

        if (repeat) {
            ev.dataTransfer.setData('id', id);
            ev.dataTransfer.setData('repeat', repeat);
        }

        this.setState({
            draggedDivId: id,
            draggedDivRepeat: repeat,
            toShowModal,
        });
    };

    // Handling dragging of the component over draggable area
    onDragOver = ev => {
        ev.preventDefault();
    };

    // Handle input typing of modal inputs
    handleChange = event => {
        const { value, name } = event.target;

        this.setState({ [name]: value });
    };

    // Handling of dropping event. This function also updates the state
    // when a component is being dropped
    onDrop = (ev, cat) => {
        let repeat, id;
        const { setCurrentSavedState } = this.props;

        if (ev.dataTransfer.getData('repeat')) {
            repeat = ev.dataTransfer.getData('repeat') === 'true' ? true : false;
            id = ev.dataTransfer.getData('id');
        } else {
            repeat = this.state.draggedDivRepeat;
            id = this.state.draggedDivId;
        }

        let placed = null;
        let { counter, inputValues, modalName, modalFontSize, modalFontWeight } = this.state;
        counter++;

        if (cat === 'complete' && !repeat) {
            placed = this.state.tasks;
            placed = placed.find(task => task.key === id);
            placed = JSON.parse(JSON.stringify(placed));
            placed.key = placed.key + '-' + counter;
            inputValues.push({
                key: placed.key,
                value: '',
            });
            placed.category = cat;
            placed.selected = false;
            placed.positionx = ev.pageX;
            placed.positiony = ev.pageY;
            placed.name = modalName;
            placed.fontSize = modalFontSize;
            placed.fontWeight = modalFontWeight;
            const prevPlaced = this.state.placed;
            placed = [placed, ...prevPlaced];
        }

        if (repeat) {
            let prevPlaced = this.state.placed;
            placed = prevPlaced.find(task => task.key === id);
            placed.category = cat;
            placed.positionx = ev.pageX;
            placed.positiony = ev.pageY;
            placed = [...prevPlaced];
        }

        this.setState(
            {
                placed,
                counter,
                inputValues,
                toShowModal: false,
                modalName: '',
                modalFontSize: '',
                modalFontWeight: '',
            },
            () => {
                const savedState = this.state;
                setCurrentSavedState(savedState);
            }
        );
    };

    // Handle input typing of input elements (which are dropped on the canvas)
    handleInputChange = (e, key) => {
        const newValue = e.target.value;
        const { inputValues } = this.state;

        const newInputValues = inputValues.filter(iv => {
            if (iv.key === key) {
                iv.value = newValue;
            }

            return iv;
        });

        this.setState({
            inputValues: newInputValues,
        });
    };

    // Handle selecting elements
    handleClick = key => {
        const { placed } = this.state;

        const newPlaced = placed.filter(pl => {
            if (pl.key === key) {
                pl.selected = !pl.selected;
            }

            return pl;
        });

        this.setState({
            placed: newPlaced,
        });
    };

    // Handle deletion of elements
    handleDelete = e => {
        if (parseInt(e.keyCode) === 46) {
            const { setCurrentSavedState } = this.props;
            const { placed } = this.state;
            const newPlaced = placed.filter(pl => {
                if (!pl.selected) {
                    return pl;
                }
                return null;
            });

            this.setState(
                {
                    placed: newPlaced,
                },
                () => {
                    const savedState = this.state;
                    setCurrentSavedState(savedState);
                }
            );
        }
    };

    render() {
        const tasks = {
            complete: [],
        };

        const { inputValues, modalX, modalY, modalName, modalFontSize, modalFontWeight } = this.state;

        // Load previously placed elements
        if (this.state.placed.length > 0) {
            this.state.placed.forEach(t => {
                if (t.type === 'label') {
                    tasks['complete'].push(
                        <div
                            key={t.key}
                            onDragStart={e => this.onDragStart(e, t.key, true)}
                            draggable
                            className={t.selected ? 'draggable selected' : 'draggable'}
                            onClick={() => {
                                this.handleClick(t.key);
                            }}
                            style={{
                                position: 'absolute',
                                top: t.positiony - 50 + 'px',
                                left: t.positionx - 160 + 'px',
                                fontSize: t.fontSize + 'px',
                                fontWeight: t.fontWeight,
                            }}
                        >
                            {t.name}
                        </div>
                    );
                } else if (t.type === 'input') {
                    tasks['complete'].push(
                        <input
                            key={t.key}
                            onDragStart={e => this.onDragStart(e, t.key, true)}
                            onClick={() => {
                                this.handleClick(t.key);
                            }}
                            draggable
                            className={t.selected ? 'draggable selected' : 'draggable'}
                            placeholder={t.name}
                            style={{
                                position: 'absolute',
                                top: t.positiony - 50 + 'px',
                                left: t.positionx - 160 + 'px',
                                fontSize: t.fontSize + 'px',
                                fontWeight: t.fontWeight,
                            }}
                            value={inputValues.find(iv => iv.key === t.key).value}
                            onChange={e => {
                                this.handleInputChange(e, t.key);
                            }}
                        ></input>
                    );
                } else {
                    tasks['complete'].push(
                        <button
                            key={t.key}
                            onDragStart={e => this.onDragStart(e, t.key, true)}
                            onClick={() => {
                                this.handleClick(t.key);
                            }}
                            draggable
                            className={t.selected ? 'draggable selected' : 'draggable'}
                            style={{
                                position: 'absolute',
                                top: t.positiony - 50 + 'px',
                                left: t.positionx - 160 + 'px',
                                fontSize: t.fontSize + 'px',
                                fontWeight: t.fontWeight,
                            }}
                        >
                            {t.name}
                        </button>
                    );
                }
            });
        }

        // Actual page rendering
        return (
            <div className='drag-drop-page' onKeyDown={e => this.handleDelete(e)} tabIndex='0'>
                <div className='container-drag'>
                    <div className='droppable' onDragOver={e => this.onDragOver(e)} onDrop={e => this.showModal(e)}>
                        {tasks.complete}
                    </div>
                    <div
                        className='wip'
                        onDragOver={e => this.onDragOver(e)}
                        onDrop={e => {
                            this.onDrop(e, 'wip');
                        }}
                    >
                        <h2>Blocks</h2>
                        <div onDragStart={e => this.onDragStart(e, 'label')} draggable className='draggable'>
                            <AppstoreOutlined style={{ marginRight: 8, color: '#D4D4D4' }} />
                            Label
                        </div>
                        <div onDragStart={e => this.onDragStart(e, 'input')} draggable className='draggable'>
                            <AppstoreOutlined style={{ marginRight: 8, color: '#D4D4D4' }} />
                            Input
                        </div>
                        <div onDragStart={e => this.onDragStart(e, 'button')} draggable className='draggable'>
                            <AppstoreOutlined style={{ marginRight: 8, color: '#D4D4D4' }} />
                            Button
                        </div>
                    </div>
                </div>
                <Modal
                    title='Edit Label'
                    visible={this.state.modalVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <Space direction='vertical' style={{ width: '100%' }}>
                        Text
                        <Input
                            type='text'
                            placeholder='Enter text to be displayed inside element'
                            name='modalName'
                            value={modalName}
                            onChange={this.handleChange}
                        />
                        X
                        <Input type='text' value={modalX + 'px'} disabled />
                        Y
                        <Input type='text' value={modalY + 'px'} disabled />
                        Font Size
                        <Input
                            type='number'
                            placeholder='Enter font size (in px)'
                            name='modalFontSize'
                            value={modalFontSize}
                            onChange={this.handleChange}
                        />
                        Font Weight
                        <Input
                            type='number'
                            placeholder='Enter font weight'
                            name='modalFontWeight'
                            value={modalFontWeight}
                            onChange={this.handleChange}
                        />
                    </Space>
                </Modal>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentSavedState: savedState => {
            dispatch(setCurrentSavedState(savedState));
        },
    };
};

const mapStateToProps = createStructuredSelector({
    savedState: selectCurrentSavedState,
});

export default connect(mapStateToProps, mapDispatchToProps)(DragDropPage);
