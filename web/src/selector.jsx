import { atoms } from './atoms';
import { Button, Dropdown, Icon } from "@symphony-ui/uitoolkit-components/components";
import { useEffect, useState, useRef } from 'react';
import { useRecoilState } from 'recoil';
import api from './api';
import CreateWorkflowModal from './create-workflow';
import styled from 'styled-components';

const Root = styled.div`
    display: grid;
    grid-template-columns: 4fr 0.5fr;
    align-items: flex-end;
    gap: .5rem;
`;

const StyledDropdown = styled(Dropdown)`
    & .tk-select .tk-select__container.tk-select__control .tk-select__value-container:hover { cursor: pointer; }
    input { user-select: none; pointer-events: none }
`;

const WorkflowDropdown = ({ currentWorkflow, setCurrentWorkflow, workflows, setWorkflows, editMode, isContentChanged, setIsContentChanged }) => {
    const { listWorkflows } = api();

    useEffect(() => listWorkflows((res) => {
        const values = res.map(({ id }) => ({ label: id, value: id }));
        setWorkflows(values);
    }), [ setCurrentWorkflow, setWorkflows ]);

    return (
        <StyledDropdown
            blurInputOnSelect
            label="Select Workflow"
            options={workflows}
            isDisabled={!editMode || isContentChanged=='modified'}
            onChange={({ target }) => {
                setCurrentWorkflow(target.value);
                setIsContentChanged('original');
            }}
            value={currentWorkflow}
        />
    );
};

const WorkflowSelector = ({ currentWorkflow, setCurrentWorkflow, editMode, isContentChanged, setIsContentChanged }) => {
    const [ createModal, setCreateModal ] = useState({ show: false });
    const [ workflows, setWorkflows ] = useRecoilState(atoms.workflows);

    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    };
    const prevWorkflows = usePrevious(workflows);

    useEffect(() => {
        if (!prevWorkflows || prevWorkflows?.length === workflows.length) {
            return;
        } else if ((prevWorkflows?.length === 0 && workflows?.length > 0) || (workflows.length < prevWorkflows?.length)) {
            setCurrentWorkflow(workflows[0]);
        } else {
            const prev = prevWorkflows?.map((w) => w.value);
            const delta = workflows.map((w) => w.value).filter((i) => prev.indexOf(i) === -1)[0];
            setCurrentWorkflow(workflows.filter((w) => w.value === delta)[0]);
        }
    }, [ prevWorkflows, workflows, setCurrentWorkflow ]);

    return (
        <Root>
            <WorkflowDropdown {...{ currentWorkflow, setCurrentWorkflow, workflows, setWorkflows, editMode, isContentChanged, setIsContentChanged }} />
            <Button
                variant="primary"
                disabled={!editMode || isContentChanged=='modified'}
                onClick={() => setCreateModal({ show: true })}
                iconLeft={<Icon iconName="plus" />}
            >
                Workflow
            </Button>
            <CreateWorkflowModal {...{ createModal, setCreateModal, setWorkflows }} />
        </Root>
    );
};
export default WorkflowSelector;