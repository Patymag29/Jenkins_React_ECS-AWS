pipeline {
    agent any
    
    environment {
        AWS_DOCKER_REGISTRY = '207635141290.dkr.ecr.ca-central-1.amazonaws.com'
        // your ECR repository name
        APP_NAME = 'my-new-image'
        AWS_DEFAULT_REGION = 'ca-central-1'
    }
    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    # list all files
                    ls -la
                    node --version
                    npm --version
                    # npm install
                    npm ci
                    npm run build
                    ls -la
                '''
            }
        }
        
        stage('Test') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    test -f build/index.html
                    npm test
                '''
            }
        }
        
        stage('Build My Docker Image') {
            agent {
                docker {
                    image 'amazon/aws-cli'
                    reuseNode true
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=""'
                }
            }
            // steps {
            //     withCredentials([usernamePassword(credentialsId: 'myNewUser', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')])
            //     {
            //         sh """
            //             apk add --no-cache aws-cli  # instala AWS CLI no Alpine
            //             docker build -t $AWS_DOCKER_REGISTRY/$APP_NAME .
            //             aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_DOCKER_REGISTRY
            //             docker push $AWS_DOCKER_REGISTRY/$APP_NAME:latest
            //         """
            //     }
            // }
            steps {
                withCredentials([usernamePassword(credentialsId: 'myNewUser', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    sh """
                        # Install Docker in Amazon Linux
                        yum update -y
                        yum install -y docker
                        
                        # Build Docker image
                        docker build -t $AWS_DOCKER_REGISTRY/$APP_NAME:latest .
                        
                        # Login to ECR and push
                        aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_DOCKER_REGISTRY
                        docker push $AWS_DOCKER_REGISTRY/$APP_NAME:latest
                    """
                }
            }
        }
        
        stage('Deploy to AWS') {
            agent {
                    docker {
                        image 'amazon/aws-cli'
                        reuseNode true
                        args '-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=""'
                    }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'myNewUser', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    sh '''
                        aws --version
                        yum install jq -y
                        LATEST_TD_REVISION=$(aws ecs register-task-definition --cli-input-json file://aws/task-definition.json | jq '.taskDefinition.revision')
                        aws ecs update-service --cluster my-new-react-app-cluster-prod --service MyNewReactAPP-service-prod --task-definition MyNewReactAPP-TaskDefinition-Prod:$LATEST_TD_REVISION
                    '''
                }
            }
        }
    }
}        
              