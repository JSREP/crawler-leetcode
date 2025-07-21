// src/styles.ts
import { Global } from '@emotion/react';

export const GlobalStyles = () => (
    <Global
        styles={{
            '.ant-card': {
                transition: 'transform 0.3s, box-shadow 0.3s !important',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1) !important'
                }
            },
            '.ant-card-head-title': {
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -16,
                    left: 0,
                    width: 50,
                    height: 3,
                    backgroundColor: '#42b983',
                    borderRadius: 2
                }
            },
            'ul': {
                margin: 0,
                padding: 0,
                listStyle: 'none'
            }
        }}
    />
);