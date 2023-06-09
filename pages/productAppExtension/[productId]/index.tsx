import { H4, Modal, Panel, Text, Textarea } from "@bigcommerce/big-design";
import { useRouter } from "next/router";
import ErrorMessage from "@components/error";
import Loading from "@components/loading";
import { useProductInfo } from "@lib/hooks";
import { useState } from "react";
import { useSession } from '../../../context/session';

const ProductAppExtension = () => {
    const router = useRouter();
    const encodedContext = useSession()?.context;
    const productId = Number(router.query?.productId);
    const { error, isLoading, product } = useProductInfo(productId);
    const { description, is_visible: isVisible, name, price, type } = product ?? {};
    const typeCapitalized = type?.replace(/^\w/, (c: string) => c.toUpperCase());
    const isVisibleString = isVisible ? 'True' : 'False';
    const [genDesc, setGenDesc] = useState('');
    const [prompt, setPrompt] = useState('What is the capital of Texas?');
    const [isOpen, setIsOpen] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [saving, setSaving] = useState(false);

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    const generateDescription = async () => {
        setWaiting(true);

        const promptJson = {
            "prompt": {
                "messages": [{
                    "content": prompt
                }]
            },
            "temperature": 0.1,
            "candidate_count": 1
        }
        const response = await fetch('/api/ai/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promptJson)
        })
            .then(async (response) => {
                if (!response.ok) {
                    console.log('Failed on request to AI');
                }
                const data = await response.json();
                const newDesc = data.candidates[0].content.replace("/n", "<br/>");
                setGenDesc(newDesc);
            })
            .catch((error) => {
                console.log(error);
            }).finally(() => {
                setWaiting(false);
            });
    }

    const saveDescription = async () => {
        const json = { "description": genDesc };
        // Update product details
        setSaving(true);

        await fetch(`/api/products/${productId}?context=${encodedContext}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json),
        })
            .then((response) => {
                if (!response.ok) {
                    console.log("Failed to save new description");
                }

                // TODO Change data so the screen auto updates

                closeModal();
            })
            .catch((error) => {
                console.log(`Error saving description\n${error}`)
            })
            .finally(() => {
                setSaving(false);
            });
    }

    const closeModal = () => {
        setPrompt('');
        setGenDesc('');
        setIsOpen(false);
    }

    return (
        <>
            <Panel header="Basic Information" marginBottom="small">
                <H4>Product name</H4>
                <Text>{name}</Text>
                <H4>Product type</H4>
                <Text>{typeCapitalized}</Text>
                <H4>Default price (excluding tax)</H4>
                <Text>${price}</Text>
                <H4>Visible on storefront</H4>
                <Text>{isVisibleString}</Text>
            </Panel>
            <Panel
                header="Description"
                margin="none"
                action={{
                    variant: 'primary',
                    text: 'Generate New',
                    onClick: () => setIsOpen(true)
                }}
            >
                <H4>Description</H4>
                <Text>{description}</Text>
            </Panel>
            <Modal
                actions={[
                    {
                        text: 'Cancel',
                        variant: 'subtle',
                        onClick: closeModal,
                    },
                    {
                        text: 'Accept',
                        variant: 'primary',
                        isLoading: saving,
                        onClick: saveDescription,
                    }
                ]}
                closeOnClickOutside={false}
                closeOnEscKey={true}
                header="Generate New Description"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <Panel
                    header="AI"
                    action={{
                        text: 'Do Magic!',
                        variant: 'secondary',
                        isLoading: waiting,
                        onClick: generateDescription
                    }}
                >
                    <Textarea
                        label="Prompt"
                        description="Provide as much or as little details as you want."
                        placeholder="Enter details here"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </Panel>
                <Textarea
                    label="Generated description"
                    description="Suggested product description based on information provided"
                    defaultValue={genDesc}
                />
            </Modal>
        </>
    );
};

export default ProductAppExtension;
