import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Divider, Form, Message, Segment } from 'semantic-ui-react'
import CommonInput from '../components/Common/CommonInput'
import ImageDropDiv from '../components/Common/ImageDropDiv'
import {
    FooterMessage,
    HeaderMessage,
} from '../components/Common/WelcomeMessage'
import { registerUser } from '../utils/authUser'
import baseUrl from '../utils/baseUrl'
import { validateUsername } from '../utils/inputValidators'
import uploadPic from '../utils/uploadPicToCloudinary'

export default function signup() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        bio: '',
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
    })

    const [showSocialLinks, setShowSocialLinks] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState()
    const [usernameAvailable, setUsernameAvailable] = useState(false)
    const [usernameLoading, setUsernameLoading] = useState(false)

    const [formLoading, setFormLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [isDisabled, setIsDisabled] = useState(true)

    const [media, setMedia] = useState(null)
    const [mediaPreview, setMediaPreview] = useState(null)
    const [highlighted, setHighlighted] = useState(false)

    const mediaInputRef = useRef()

    const { name, email, password, bio } = user

    const inputChangeHandler = (e) => {
        const { name, value, files } = e.target
        if (name === 'media') {
            setMedia(files[0])
            setMediaPreview(URL.createObjectURL(files[0]))
        }
        setUser((prev) => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        const isUser = Object.values({ name, email, password, bio }).every(
            (item) => Boolean(item)
        )
        isUser ? setIsDisabled(false) : setIsDisabled(true)
    }, [user])

    let reqCanceler

    const checkUsername = async () => {
        setUsernameLoading(true)
        try {
            reqCanceler && reqCanceler()
            const CancelToken = axios.CancelToken

            const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
                cancelToken: new CancelToken((canceler) => {
                    reqCanceler = canceler
                }),
            })
            setErrorMsg(null)
            if (res.data === 'Available') {
                setUsernameAvailable(true)
                setUser((prev) => ({ ...prev, username }))
            }
        } catch (e) {
            setErrorMsg('Username not available')
            setUsernameAvailable(false)
        }
        setUsernameLoading(false)
    }

    useEffect(() => {
        username === '' ? setUsernameAvailable(false) : checkUsername()
    }, [username])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            let profilePicUrl
            if (media !== null) {
                profilePicUrl = await uploadPic(media)
            }
            if (!profilePicUrl) {
                setFormLoading(false)
                setErrorMsg('Error Uploading Image')
            }
            await registerUser(user, profilePicUrl, setErrorMsg, setFormLoading)
        } catch (e) {
            setErrorMsg(e.message)
        }
        setFormLoading(false)
    }

    return (
        <>
            <HeaderMessage />
            <Form
                loading={formLoading}
                error={errorMsg !== null}
                onSubmit={handleSubmit}
            >
                <Message
                    error
                    header="Opps!"
                    content={errorMsg}
                    onDismiss={() => setErrorMsg(null)}
                />
                <Segment>
                    <ImageDropDiv
                        setMedia={setMedia}
                        mediaPreview={mediaPreview}
                        setMediaPreview={setMediaPreview}
                        highlighted={highlighted}
                        setHighlighted={setHighlighted}
                        onChange={inputChangeHandler}
                        inputRef={mediaInputRef}
                    />
                    <Form.Input
                        required
                        label="Name"
                        placeholder="Name"
                        name="name"
                        value={name}
                        onChange={inputChangeHandler}
                        fluid
                        icon="user"
                        iconPosition="left"
                    />
                    <Form.Input
                        required
                        label="Email"
                        placeholder="Email"
                        name="email"
                        value={email}
                        onChange={inputChangeHandler}
                        fluid
                        icon="envelope"
                        iconPosition="left"
                        type="email"
                    />
                    <Form.Input
                        required
                        label="Password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={inputChangeHandler}
                        fluid
                        icon={{
                            name: 'eye',
                            circular: true,
                            link: true,
                            onClick: () => setShowPassword((s) => !s),
                        }}
                        iconPosition="left"
                        type={showPassword ? 'text' : 'password'}
                    />
                    <Form.Input
                        loading={usernameLoading}
                        error={!usernameAvailable}
                        required
                        label="Username"
                        placeholder="Username"
                        name="username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                            setUsernameAvailable(
                                validateUsername(e.target.value)
                            )
                        }}
                        fluid
                        icon={usernameAvailable ? 'check' : 'close'}
                        iconPosition="left"
                    />
                    <CommonInput
                        user={user}
                        showSocialLinks={showSocialLinks}
                        setShowSocialLinks={setShowSocialLinks}
                        onChange={inputChangeHandler}
                    />
                    <Divider />
                    <Button
                        icon="signup"
                        content="signup"
                        type="submit"
                        color="orange"
                        disabled={isDisabled || !usernameAvailable}
                    />
                </Segment>
            </Form>
            <FooterMessage />
        </>
    )
}
