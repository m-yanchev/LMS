import React from 'react'
import styles from './styles.css'
import {
    LINE_BREAK,
    TABLE_IDENTIFIER,
    TABLE_ROW_IDENTIFIER,
    TABLE_CELL_IDENTIFIER,
    NOTE_BOLD_BEGIN_IDENTIFIER,
    NOTE_BOLD_END_IDENTIFIER,
    LIST_IDENTIFIER,
    LIST_ITEM_IDENTIFIER
} from "../../../constants";
import ImageBox from "../ImageBox";
import {getComponentClassName} from "../../../../common/helpers";
import Formula from "../Formula";
import ErrorBoundary from "../../../../ReactApp/smartComponents/ErrorBoundary";
import {IMAGES_FOLDER} from "../../../../common/constants";

class Content extends React.Component {

    render() {
        const {contextStyles} = this.props;

        const str = this.props.children;
        this._blockArray = [];
        let startPos = 0;
        while (true) {
            let foundPos = str.indexOf(LINE_BREAK, startPos);
            if (foundPos === -1) break;
            this._blockArray.push(this._getBlocks(str.slice(startPos, foundPos), startPos));
            startPos = foundPos + LINE_BREAK.length;
        }
        this._blockArray.push(this._getBlocks(str.slice(startPos), startPos));

        return (
            <ErrorBoundary>
                <div key={str} className={getComponentClassName(styles, contextStyles, 'content')}>
                    {this._blockArray}
                </div>
            </ErrorBoundary>
        );
    }

    _getBlocks = (str, pKey) => {
        const {model, taskKey, imageList} = this.props;
        const imageIdentifier = 'рисунок';
        const contentImagePath = '/' + IMAGES_FOLDER;
        if (str.indexOf(imageIdentifier) === 0) {
            return getImage()
        } else if (str.indexOf(TABLE_IDENTIFIER) === 0) {
            return getTable()
        } else if (str.indexOf(LIST_IDENTIFIER) === 0) {
            return getList()
        } else {
            return this._getParagraph(str, pKey);
        }

        function getImage() {

            const taskIndex = +str.slice(imageIdentifier.length) - 1;
            const path = [contentImagePath, model].join('/');
            if (imageList) {
                if (typeof imageList !== 'object') throw new Error('"imageList" is expected to be an object');
                if (taskIndex >= imageList.length) {
                    return <p key={String(pKey)}>{str}</p>;
                } else {
                    const getContent = imageList.getContent;
                    if (typeof getContent !== 'function')
                        throw new Error('"imageList.getContent" is expected to be a function');
                    const {type, fileData, index} = imageList.getContent(taskIndex);
                    if (type === 'client') {
                        if (!fileData || typeof fileData !== 'object')
                            throw new Error('"fileData" is expected to be an object');
                    } else if (type === 'server') {
                        if (typeof index !== 'number') throw new Error('"index" is expected to be number');
                    } else {
                        throw new Error('"type" is expected to be "client" or "server" string');
                    }
                    return <ImageBox
                        key={taskIndex}
                        contextStyles={styles}
                        image={fileData}
                        rootKey={taskKey}
                        path={path}
                        index={index}
                        isNaturalSize
                    />
                }
            } else {
                return <ImageBox
                    key={taskIndex}
                    contextStyles={styles}
                    rootKey={taskKey}
                    path={path}
                    index={taskIndex}
                    isNaturalSize
                />
            }
        }

        function getTable() {
            const getCell = str => {
                return <Cell key={str}>{str}</Cell>
            };
            const getRow = str => {
                const cellProps = {str, identifierWord: TABLE_CELL_IDENTIFIER, parser: getCell, Block: Row};
                return getBlock(cellProps)
            };
            const rowProps = {str, identifierWord: TABLE_ROW_IDENTIFIER, parser: getRow, Block: Table};
            return getBlock(rowProps)
        }

        function getList() {
            const getItem = str => {
                return <Item key={str}>{str}</Item>
            };
            const props = {str, identifierWord: LIST_ITEM_IDENTIFIER, parser: getItem, Block: List};
            return getBlock(props)
        }

        function getBlock(props) {
            const {str, identifierWord, parser, Block} = props;
            let pos = str.indexOf(identifierWord);
            const blocks = [];
            while (pos !== -1) {
                const firstPos = pos + identifierWord.length;
                const nextPos = str.indexOf(identifierWord, firstPos);
                blocks.push(nextPos === -1 ? parser(str.slice(firstPos)) : parser(str.slice(firstPos, nextPos)));
                pos = nextPos;
            }
            return <Block key={str}>{blocks}</Block>;
        }

        function Item(props) {
            return (
                <li>
                    <Content key={props.children} model={model} taskKey={taskKey} imageList={imageList}>
                        {props.children}
                    </Content>
                </li>
            )
        }

        function List(props) {
            return <ul>{props.children}</ul>
        }

        function Table(props) {
            return <table>
                <tbody>{props.children}</tbody>
            </table>
        }

        function Row(props) {
            return <tr>{props.children}</tr>
        }

        function Cell(props) {
            return (
                <td className={styles.td}>
                    <Content key={props.children} model={model} taskKey={taskKey} imageList={imageList}>
                        {props.children}
                    </Content>
                </td>
            )
        }
    };

    _getParagraph = (str, pKey) => {
        return <p key={str + pKey}>{this._getTextBlocks(str, pKey)}</p>
    };

    _getTextBlocks = (str, pKey) => {
        const textBlocks = [];
        const blockType = this._nextIdentifier(str);
        if (blockType === 'bold') {
            const {beforeText, block, restStr, nextPos} = this._boldBlock(str, pKey);
            textBlocks.push(beforeText);
            textBlocks.push(block);
            return textBlocks.concat(this._getTextBlocks(restStr, +pKey + nextPos));
        } else if (blockType === 'math') {
            const {beforeText, block, restStr, nextPos} = this._mathBlock(str, pKey);
            textBlocks.push(beforeText);
            textBlocks.push(block);
            return textBlocks.concat(this._getTextBlocks(restStr, +pKey + nextPos));
        } else {
            textBlocks.push(str);
            return textBlocks;
        }
    };

    _nextIdentifier = (str) => {
        const boldPos = str.indexOf(NOTE_BOLD_BEGIN_IDENTIFIER);
        const mathPos = str.indexOf('`');
        if (boldPos !== -1 && (boldPos < mathPos || mathPos === -1)) {
            return 'bold'
        } else if (mathPos !== -1 && (mathPos < boldPos || boldPos === -1)) {
            return 'math'
        } else {
            return 'text'
        }
    };

    _boldBlock = (str, pKey) => {
        const beginPos = str.indexOf(NOTE_BOLD_BEGIN_IDENTIFIER);
        const beforeText = str.slice(0, beginPos);
        const endPos = str.indexOf(NOTE_BOLD_END_IDENTIFIER);
        const blockStr = endPos !== -1 ?
            str.slice(beginPos + NOTE_BOLD_BEGIN_IDENTIFIER.length, endPos) :
            str.slice(beginPos + NOTE_BOLD_BEGIN_IDENTIFIER.length);
        const nextPos = endPos !== -1 ? endPos + NOTE_BOLD_END_IDENTIFIER.length : -1;
        return {
            beforeText,
            block: <b key={blockStr + pKey}>{blockStr}</b>,
            restStr: nextPos !== -1 ? str.slice(nextPos) : '',
            nextPos
        }
    };

    _mathBlock = (str, pKey) => {
        const beginPos = str.indexOf('`');
        const beforeText = str.slice(0, beginPos);
        const endPos = str.indexOf('`', beginPos + 1) + 1;
        const blockStr = endPos !== 0 ? str.slice(beginPos, endPos) : str.slice(beginPos) + '`';
        return {
            beforeText,
            block: <Formula key={blockStr + pKey}>{blockStr}</Formula>,
            restStr: endPos !== 0 ? str.slice(endPos) : '',
            nextPos: endPos !== 0 ? endPos : -1
        }
    }
}

export default Content