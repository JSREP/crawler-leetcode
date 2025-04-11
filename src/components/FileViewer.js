import React from 'react';
import { List, Button, Card } from 'antd';
import { getFileContent, listDirectory } from '../utils/fileSystem';

class FileViewer extends React.Component {
    state = {
        currentPath: '',
        files: [],
        fileContent: '',
    };

    componentDidMount() {
        this.loadDirectory('');
    }

    loadDirectory = (path) => {
        this.setState({
            currentPath: path,
            files: listDirectory(path),
            fileContent: '',
        });
    };

    handleFileClick = (name) => {
        const { currentPath } = this.state;
        const fullPath = currentPath ? `${currentPath}/${name}` : name;
        const content = getFileContent(fullPath);

        content ? this.setState({ fileContent: content }) : this.loadDirectory(fullPath);
    };

    handleBack = () => {
        const { currentPath } = this.state;
        const newPath = currentPath.split('/').slice(0, -1).join('/');
        this.loadDirectory(newPath);
    };

    render() {
        const { currentPath, files, fileContent } = this.state;

        return (
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {currentPath && (
                            <Button
                                type="link"
                                onClick={this.handleBack}
                                style={{ marginRight: 8 }}
                            >
                                ← 返回
                            </Button>
                        )}
                        <span>{currentPath || '根目录'}</span>
                    </div>
                }
            >
                <List
                    bordered
                    dataSource={files}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    onClick={() => this.handleFileClick(item)}
                                    key="open"
                                >
                                    打开
                                </Button>
                            ]}
                        >
                            <List.Item.Meta title={item} />
                        </List.Item>
                    )}
                />
                {fileContent && (
                    <Card
                        title="内容预览"
                        type="inner"
                        style={{ marginTop: 16 }}
                    >
            <pre style={{
                backgroundColor: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                maxHeight: '50vh',
                overflow: 'auto'
            }}>
              {fileContent}
            </pre>
                    </Card>
                )}
            </Card>
        );
    }
}

export default FileViewer;