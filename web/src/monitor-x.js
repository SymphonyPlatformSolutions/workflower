import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from './api';
import Prism from 'prismjs';
import 'prismjs/themes/prism.min.css';

const Grid = styled.div`
    display: grid;
    grid-template: auto / auto auto auto auto;
    margin-bottom: 2rem;
`;

const Row = styled.div`
    display: contents;
    &:first-child { font-weight: 800 }
    & div { background: inherit; padding: .3rem }
    &:not(:first-child):hover { cursor: pointer; background: var(--tk-color-electricity-20) }
`;

    const DataGrid = ({ headers, data, callback }) => (
    <Grid>
        <Row>
            {headers.map((header, i) => <div key={i}>{header.substring(0, 1).toUpperCase() + header.substring(1)}</div>)}
        </Row>
        {data.map((row, i) => (
            <Row key={i} onClick={() => callback(row)}>
                {headers.map((header, j) => <div key={j}>{row[header.replace(/ /g, '')]}</div>)}
            </Row>
        ))}
    </Grid>
);

const Instances = ({ instances, setActivities }) => {
    const getInstanceActivities = ({ id, instanceId }) => {
        api.listInstanceActivities(id, instanceId, (r) => setActivities(r));
    };
    const headers = [ 'instance Id', 'status', 'start Date', 'end Date' ];
    return (!instances || instances.length === 0) ? 'No instances yet' : (<DataGrid {...{ headers, data: instances, callback: getInstanceActivities }} />);
};

const Activities = ({ activities }) => {
    const headers = [ 'activity Id', 'type', 'start Date', 'end Date' ];
    const [ variables, setVariables ] = useState();

    useEffect(() => Prism.highlightAll(), [ variables ]);

    return (
        <>
            <DataGrid {...{ headers, data: activities.activities, callback: (row) => setVariables(row.variables.outputs) }} />
            { variables && (
                <>
                    <b>Variables:</b>
                    <pre style={{ margin: 0, height: '20rem', fontSize: '.8rem' }}>
                        <code className="language-javascript">
                            { JSON.stringify(variables, null, 2) }
                        </code>
                    </pre>
                </>
            ) }
        </>
    );
};

const MonitorX = ({ currentWorkflow }) => {
    const [ instances, setInstances ] = useState();
    const [ activities, setActivities ] = useState();

    useEffect(() => {
        api.listWorkflowInstances(currentWorkflow.value.replace('.swadl.yaml', ''), (r) => setInstances(r));
    }, []);

    return (
        <div className="tk-text-color">
            <Instances {...{ instances, setActivities }} />
            { activities && <Activities {...{ activities }} /> }
        </div>
    )
};
export default MonitorX;
