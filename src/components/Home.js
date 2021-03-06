import React, { useEffect, useState, useMemo } from 'react'
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import Navbar from './Navbar';
import gql from 'graphql-tag';
import './css/Home.css';

// Material ui
import LinearProgress from '@material-ui/core/LinearProgress';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

// Content
import MainDashboard from './MainDashboard';
import Repositories from './Repositories';
import FullData from './FullData';
import CreateMutates from './CreateMutates';
import Projects from './Projects';

export default function Home() {

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const client = new ApolloClient({
        uri: 'https://api.github.com/graphql',
        request: (operation) => {
        operation.setContext({
            headers: {
            authorization: token ? `bearer ${token}` : ''
            }
        })
        }
    })


    const [ repos,setRepos ] = useState();

    async function getRepos(){
        await client.query({
            query: gql`
            query ($number_of_repos: Int = 100) {
            viewer {
                id
                name
                email
                location
                followers(first: $number_of_repos){
                nodes{
                    id
                    name
                }
                }
                following(first: $number_of_repos){
                nodes{
                    id
                    name
                }
                }
                avatarUrl
                repositories(first: $number_of_repos) {
                nodes {
                    id
                    name
                    url
                    forkCount
                    stargazers{
                        totalCount
                    }
                    pullRequests{
                        totalCount
                    }
                    collaborators{
                    totalCount
                    }
                    issues{
                    totalCount
                    }
                }
                }
                repositoriesContributedTo(last: $number_of_repos){
                nodes{
                    name
                    nameWithOwner
                    isFork
                    homepageUrl
                }
                }
                pullRequests(first: $number_of_repos){
                nodes{
                    headRefName
                    baseRepository {
                    name
                    }
                    number
                    merged
                }
                }
                projects(first: $number_of_repos){
                nodes{
                    id
                    name
                    creator{
                        login
                    }
                    state
                }
                }
            }
            }

            `}).then(result => setRepos(result))
    }
    
    useEffect(() => {
        getRepos();
    })
    return (

        <div className="MainDivHome">
            <ApolloProvider client={client}>
            <CssBaseline />
            
            <Navbar />
            <Container maxWidth="xl" className="MainContainer">
            {(() => {
                if (repos) {
                return (
                    <div className="components">
                    <MainDashboard data={repos}/>
                    <CreateMutates id={repos.data.viewer.id} repositories={repos.data.viewer.repositories.nodes}/>
                    <Repositories data={repos.data.viewer.repositories.nodes}/>
                    <Projects data={repos.data.viewer.projects.nodes} />
                    <FullData className="FullData" pullRequests={repos.data.viewer.pullRequests.nodes} 
                    Contributions={repos.data.viewer.repositoriesContributedTo.nodes}/>
                    </div>
                 )
                }
                else{
                    return(
                        <div className="Loading">
                        <LinearProgress className="loading-progress"/>
                        <LinearProgress className="loading-progress"/>
                        </div>
                    )
                }
            })()}
            </Container>
            </ApolloProvider>
        </div>
    )
}
