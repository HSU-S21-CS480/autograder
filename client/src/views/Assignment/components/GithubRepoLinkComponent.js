import React from 'react';
import validator from 'validator';
import { Container, Row, Button, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


// Simple form to collect and verify URL for submission to database
const GithubRepoLink = ({ assignment_id, props }) => {

    const [url, setUrl] = React.useState("");           // URL to be submitted
    const [status, setStatus] = React.useState("");     // Used to provide user feedback

    // Handles submission of URL to API
    const submitUrl = async e => {
        e.preventDefault();
        try {
            if (url) {
                const result = await props.models.assignment.linkRepository(assignment_id, url);
                (typeof(result) === "number") ? setStatus("SUCCESS") : setStatus(result);
                setUrl("");
                e.target.reset();
            }
        }
        catch (err) {
            setUrl("");
            setStatus(err);
        }
    }

    // Verifies the URL is correctly formatted before setting the current url
    const verifyUrl = input => {
        setStatus("");
        if (!validator.isURL(input)) {
            (input === "") ? setStatus("") : setStatus("Must be complete URL! ex: https://github.com/{org}/{branch}");
            setUrl("");
            return false;
        }
        else {
            setStatus("");
            setUrl(input);
            return true;
        }
    }


    return (
        <Container>
            {(status === "SUCCESS") && <Alert variant="success">Repository was successfully linked!</Alert>}
            {!(status === "SUCCESS" || status === "") && <Alert variant="danger">{status}</Alert>}
            <Form onSubmit={submitUrl} disabled={!url}>
                <Form.Group style={{ marginTop: "3em" }}>
                    <Form.Label>Paste URL to Github Repository</Form.Label>
                    <Form.Control as="input" placeholder="URL" onInput={e => verifyUrl(e.target.value)} />
                </Form.Group>
                <Button type="submit" disabled={!url}>Link Repo</Button>
            </Form>
        </Container>
    )



}


export default GithubRepoLink;