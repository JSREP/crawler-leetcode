import * as React from 'react';
import { Form, Input, InputNumber, Radio, FormInstance } from 'antd';
import { SectionProps } from '../types';

interface BasicInfoProps {
  form: FormInstance;
}

/**
 * 挑战基本信息表单部分
 */
const BasicInfo: React.FC<BasicInfoProps> = ({ form }) => {
  return (
    <>
      <Form.Item
        name="id"
        label="ID"
        rules={[{ required: true, message: '请输入ID' }]}
        tooltip="每个挑战的唯一数字ID，已自动填入可用的下一个ID"
      >
        <InputNumber style={{ width: '100%' }} min={1} />
      </Form.Item>

      <Form.Item
        name="idAlias"
        label="ID别名"
        tooltip="用于在URL和界面上显示的友好名称"
      >
        <Input placeholder="如: ruishu-5、leetcode-42、jsvmp-advanced 等" />
      </Form.Item>

      <Form.Item
        name="platform"
        label="平台"
        rules={[{ required: true, message: '请选择平台' }]}
      >
        <Radio.Group>
          <Radio.Button value="Web">Web</Radio.Button>
          <Radio.Button value="Android">Android</Radio.Button>
          <Radio.Button value="iOS">iOS</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="name"
        label="中文名称"
        rules={[{ required: true, message: '请输入中文名称' }]}
      >
        <Input placeholder="如: 5代瑞数反爬、字节TikTok登录加密等" />
      </Form.Item>

      <Form.Item
        name="nameEn"
        label="英文名称"
      >
        <Input placeholder="如: Riskined v5 Anti-Crawler, ByteDance TikTok Login Encryption" />
      </Form.Item>
    </>
  );
};

export default BasicInfo; 