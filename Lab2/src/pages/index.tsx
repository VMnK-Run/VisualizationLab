import { Col, Row } from 'antd';
import React, { useEffect } from 'react';
import Scatter1 from './Scatter1';
import Scatter2 from './Scatter2';
import request from 'umi-request';

const Index: React.FC = () => {
    useEffect(() => {
        request.get('/server/add/1/2').then((res) => {
            console.log(res);
        });
        request.post('/server/test', {
            data: {
                name: 'test1'
            }
        }).then((res) => {
            console.log(res);
        })
    }, []);

    return (
        <Row align="middle">
            <Col
                style={{
                    border: '1px solid #222',
                }}
                span={12}
            >
                <div
                    style={{
                        width: '50vw',
                        height: '100vh',
                    }}
                >
                    <Scatter1 />
                </div>
            </Col>
            <Col
                style={{
                    border: '1px solid #222',
                }}
                span={12}
            >
                <div
                    style={{
                        width: '50vw',
                        height: '100vh',
                    }}
                >
                    <Scatter2 />
                </div>
            </Col>
        </Row>
    );
};

export default Index;
