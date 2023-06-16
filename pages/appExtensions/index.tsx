import { Button, Dropdown, Form, FormGroup, Input, Modal, Panel, Select, Table } from '@bigcommerce/big-design';
import { AddIcon, MoreHorizIcon } from '@bigcommerce/big-design-icons';
import { ReactElement, useState } from 'react';
import ErrorMessage from '../../components/error';
import Loading from '../../components/loading';
import { useGetAppExtensions } from '../../lib/hooks';
import { AppExtensionTableItem } from '../../types';
import { useSession } from '../../context/session';

const Products = () => {
    const encodedContext = useSession()?.context;
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const { error, isLoading, edges = [], mutateList } = useGetAppExtensions();
    const itemsPerPageOptions = [10, 20, 50, 100];
    const tableItems: AppExtensionTableItem[] = edges.map(({ node }) => ({
        id: node?.id,
        name: node?.label?.defaultValue,
        model: node?.model,
        context: node?.context,
    }));
    const [regLoading, setRegLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    // Using default values for ease of use while in development
    const [model, setModel] = useState('PRODUCTS');
    const [url, setUrl] = useState('/productAppExtension/${id}')

    const onItemsPerPageChange = newRange => {
        setCurrentPage(1);
        setItemsPerPage(newRange);
    };

    const registerAppExtension = async () => {
        const json = {
            title: title,
            model: model,
            url: url,
        }
        const response = await fetch(`/api/appExtensions?context=${encodedContext}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json),
        })
            .then(async (response) => {
                mutateList();
            })
            .catch((error) => {
                console.log(error);
            }).finally(() => {
                setRegLoading(false);
                setIsOpen(false);
            });
    }

    const deleteExtension = async (id: string) => {
        const json = {
            id: id
        }
        const response = await fetch(`/api/appExtensions?context=${encodedContext}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json),
        })
            .then(async (response) => {
                mutateList();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const renderAction = (id: string): ReactElement => (
        <Dropdown
            items={[
                { content: 'Delete Extension', onItemClick: () => { deleteExtension(id) }, hash: 'edit' },
            ]}
            toggle={<Button iconOnly={<MoreHorizIcon color="secondary60" />} variant="subtle" />}
        />
    );

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <>
            <Panel
                id="appextensions"
                header='Manage Registered App Extensions'
                action={{
                    variant: 'primary',
                    text: 'App Extension',
                    iconLeft: (<AddIcon />),
                    onClick: () => setIsOpen(true)
                }}
            >
                <Table
                    columns={[
                        { header: 'App Extension', hash: 'name', render: ({ id, name }) => (name), isSortable: true },
                        { header: 'Context', hash: 'context', render: ({ context }) => (context), isSortable: true },
                        { header: 'Model', hash: 'model', render: ({ model }) => (model), isSortable: true },
                        { header: 'Action', hideHeader: true, hash: 'id', render: ({ id }) => renderAction(id) },
                    ]}
                    items={tableItems}
                    itemName="App Extensions"
                    pagination={{
                        currentPage,
                        totalItems: edges.length,
                        onPageChange: setCurrentPage,
                        itemsPerPageOptions,
                        onItemsPerPageChange,
                        itemsPerPage,
                    }}
                    stickyHeader
                />
            </Panel>
            <Modal
                actions={[
                    {
                        text: 'Cancel',
                        variant: 'subtle',
                        onClick: () => setIsOpen(false),
                    },
                    {
                        text: 'Create',
                        variant: 'primary',
                        onClick: () => {
                            // Register extension
                            setRegLoading(true);
                            registerAppExtension();
                        },
                        isLoading: regLoading
                    },
                ]}
                closeOnClickOutside={false}
                closeOnEscKey={true}
                header="App Extension Details"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <Form>
                    <FormGroup>
                        <Input
                            label="App extension name"
                            placeholder='Name of app extension'
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Select
                            label="Model type"
                            onOptionChange={(value) => setModel(value)}
                            options={[
                                { value: 'CUSTOMERS', content: 'Customers' },
                                { value: 'ORDERS', content: 'Orders' },
                                { value: 'PRODUCTS', content: 'Products' },
                            ]}
                            placeholder=""
                            required
                            value={model}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Select
                            label="Context"
                            onOptionChange={() => null}
                            options={[
                                { value: 'PANEL', content: 'Panel' },
                            ]}
                            value='PANEL'
                            required
                            disabled
                        />
                    </FormGroup>
                    <FormGroup>
                        <Input
                            label="URL"
                            description="The URI that will be called from the control panel"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </FormGroup>
                </Form>
            </Modal>
        </>
    );
};

export default Products;
