import { atoms } from './atoms';
import Loader from '@symphony-ui/uitoolkit-components/components/loader';
import { RecoilRoot, useRecoilState } from 'recoil';
import api from './api';
import FadeToast from './fade-toast';
import React, { Suspense, useState, useEffect, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';

const Editor = lazy(() => import('./editor'));
const Console = lazy(() => import('./console'));
const WorkflowSelector = lazy(() => import('./selector'));
const ActionBar = lazy(() => import('./action-bar'));
const Monitor = lazy(() => import('./monitor'));

const Root = styled.div`
    display: flex;
    gap: .5rem;
    font-family: SymphonyLato, serif;
    font-size: 1rem;
    flex-direction: column;
    height: 100%;
`;

const LoadingRoot = styled.div`
    font-size: 6rem;
    padding-left: calc(50vw - 3rem);
    padding-top: calc(50vh - 3rem);
`;

const App = () => {
    const [ showConsole, setShowConsole ] = useState(true);
    const editMode = useRecoilState(atoms.editMode)[0];
    const [ markers, setMarkers ] = useState([]);
    const [ theme, setTheme ] = useState('light');
    const [ session, setSession ] = useRecoilState(atoms.session);
    const { parseJwt } = api();

    const initSymphony = (appId) => window.SYMPHONY.remote.hello().then((data) => {
        const bodyClasses = []
        if (data.themeV2.name === 'dark') {
            bodyClasses.push('tk-dark');
        }
        if (data.themeV2.isCondensedMode) {
            bodyClasses.push('tk-condensed');
        }
        document.querySelector('body').className = bodyClasses.join(' ');
        setTheme(data.themeV2.name);

        SYMPHONY.application.connect(
            appId,
            ['modules', 'applications-nav', 'extended-user-info' ],
            [`${appId}:app`],
        ).then(() => {
            const token = window.localStorage.getItem('token');
            if (token !== null) {
                const jwt = parseJwt(token);
                if (new Date().getTime() < (jwt.exp * 1000)) {
                    setSession({ token });
                }
            }
            const userInfoService = SYMPHONY.services.subscribe('extended-user-info');
            if (userInfoService) {
                userInfoService.getJwt().then((token) => {
                    if (token) {
                        setSession({ token });
                        window.localStorage.setItem('token', token);
                    }
                });
            }
        });
    });

    useEffect(() => {
        const isDev = window.location.hostname === 'localhost';
        const appId = isDev ? 'localhost-10443' : 'wdk-studio';

        if (!window.SYMPHONY) {
            setSession({ isDev });
            return;
        }
        initSymphony(appId);
    }, []);

    const Spinner = () => (
        <LoadingRoot>
            <Loader variant="primary" />
        </LoadingRoot>
    );

    return !session ? 'Loading..' : (!window.SYMPHONY && !session.isDev) ? 'This app only works in Symphony' : (
        <Suspense fallback={<Spinner />}>
            <Root>
                <WorkflowSelector />
                <ActionBar {...{ showConsole, setShowConsole, markers }} />
                { editMode && <Editor {...{ markers, setMarkers, theme }} /> }
                { !editMode && <Monitor /> }
                { showConsole && <Console {...{ theme }} /> }
                <FadeToast />
            </Root>
        </Suspense>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<RecoilRoot><App /></RecoilRoot>);
