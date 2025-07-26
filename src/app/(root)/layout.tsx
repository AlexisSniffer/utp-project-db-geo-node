'use client'

import {
  AimOutlined,
  FundProjectionScreenOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, theme } from 'antd'
import Link from 'next/link'
import { useState } from 'react'
import styles from './page.module.css'

const { Header, Sider, Content } = Layout

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className={styles['demo-logo-vertical']} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: 'Inicio',
            },
            {
              key: '2',
              icon: <AimOutlined />,
              label: <Link href="/track">Rastrear</Link>,
            },
            {
              key: '3',
              icon: <FundProjectionScreenOutlined />,
              label: <Link href="/map">Mapa</Link>,
            },
            {
              type: 'divider',
            },
            {
              key: '4',
              icon: <SettingOutlined />,
              label: 'Settings',
              children: [
                {
                  key: '4-1',
                  icon: <SettingOutlined />,
                  label: <Link href="/settings/config">Config</Link>,
                },
                {
                  key: '4-2',
                  icon: <UserOutlined />,
                  label: <Link href="/settings/users">Users</Link>,
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
