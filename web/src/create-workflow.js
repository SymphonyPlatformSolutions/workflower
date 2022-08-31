import { useEffect, useState, useRef } from 'react';
import {
    Button, Loader, TextField, Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import TemplateSelector from './template-selector';
import { api } from './api';

const CreateWorkflowModal = ({ createModal, setCreateModal, setToast, setWorkflows }) => {
    const [ newName, setNewName ] = useState('');
    const [ swadlTemplate, setSwadlTemplate ] = useState();

    const showToast = (msg, error = 'false') => {
        setToast({ show: true, content: msg, error });
        setTimeout(() => {
            setToast({ show: false });
        }, 2000);
        setCreateModal((old) => ({ ...old, loading: false }));
    };

    const createWorkflow = () => {
        if (newName.trim().length < 3) {
            showToast(`Workflow name needs to be at least 3 characters long`, 'true');
            return;
        }
        if (newName.indexOf(' ') > -1) {
            showToast(`Workflow name cannot contain spaces`, 'true');
            return;
        }
        setCreateModal({ show: true, loading: true });
        const template = swadlTemplate.replace(/newId/g, newName.replace(/-/g, ''));
        api.addWorkflow({ workflow: newName, contents: template }, (res) => {
            showToast('New workflow added', 'false');
            setCreateModal({ show: false });
            setNewName('');
            const newWorkflow = { label: res.workflow, value: res.workflow };
            setWorkflows((old) => ([ ...old, newWorkflow ].sort((a, b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0))));
        }, ({ message }) => {
            showToast(message, 'true');
        });
    };

    const nameRef = useRef();
    useEffect(() => {
        if (nameRef.current) {
            nameRef?.current?.focus();
        }
    }, [ createModal?.show ]);

    return (
        <Modal size="small" show={createModal.show}>
            <ModalTitle>Create Workflow</ModalTitle>
            <ModalBody>
                <TemplateSelector {...{ setSwadlTemplate }} />
                <TextField
                    ref={nameRef}
                    label="Name"
                    placeholder="some-process-abc"
                    value={newName}
                    disabled={createModal.loading}
                    onChange={({ target }) => setNewName(target.value)}
                />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    onClick={createWorkflow}
                    disabled={createModal.loading}
                >
                    { createModal.loading ? <Loader /> : 'Create' }
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setCreateModal({ show: false })}
                    disabled={createModal.loading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};
export default CreateWorkflowModal;