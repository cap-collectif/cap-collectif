<?php

namespace Capco\AppBundle\Controller\Site;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;

const USER_FRAGMENT = '
    id
    email
    username
    userType {
      name
    }
    createdAt
    updatedAt
    lastLogin
    rolesText
    consentExternalCommunication
    enabled
    isEmailConfirmed
    locked
    phoneConfirmed
    gender
    dateOfBirth
    website
    biography
    address
    zipCode
    city
    phone
    url
';

const USER_HEADERS = [
    'user_id',
    'user_email',
    'user_userName',
    'user_TypeName',
    'user_createdAt',
    'user_updatedAt',
    'user_lastLogin',
    'user_rolesText',
    'user_consentExternalCommunication',
    'user_enabled',
    'user_isEmailConfirmed',
    'user_locked',
    'user_phoneConfirmed',
    'user_gender',
    'user_dateOfBirth',
    'user_websiteUrl',
    'user_biography',
    'user_address',
    'user_zipCode',
    'user_city',
    'user_phone',
    'user_profileUrl',
];

const USER_HEADERS_EVENTS = [
    'user_id',
    'user_email',
    'user_userName',
    'user_TypeName',
    'event_RegisteredOn',
    'event_privateRegistration',
    'user_createdAt',
    'user_updatedAt',
    'user_lastLogin',
    'user_rolesText',
    'user_consentExternalCommunication',
    'user_enabled',
    'user_isEmailConfirmed',
    'user_locked',
    'user_phoneConfirmed',
    'user_gender',
    'user_dateOfBirth',
    'user_websiteUrl',
    'user_biography',
    'user_address',
    'user_zipCode',
    'user_city',
    'user_phone',
    'user_profileUrl',
];

const EVENTS_HEADERS = [
    'title',
    'body',
    'media_id',
    'media_url',
    'author_id',
    'author_email',
    'created_at',
    'updated_at',
    'is_enabled',
    'start_at',
    'end_at',
    'zipCode',
    'address',
    'city',
    'country',
    'lat',
    'lng',
    'link',
    'registration_enabled',
    'comments_count',
    'is_commentable',
    'meta_description',
    'custom_code',
];

class ExportController extends Controller
{
    /**
     * @Route("/export-event-participants/{eventId}", name="app_export_event_participants")
     * @ParamConverter("event", options={"mapping": {"eventId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadEventParticipantsAction(Event $event): StreamedResponse
    {
        $this->get(GraphQlAclListener::class)->disableAcl();
        $executor = $this->get('overblog_graphql.request_executor');
        $connectionTraversor = $this->get(ConnectionTraversor::class);

        $data = $executor
            ->execute('internal', [
                'query' => $this->getEventContributorsGraphQLQuery($event->getId()),
                'variables' => [],
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['errors']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }
        $fileName =
            (new \DateTime())->format('Y-m-d') .
            '-registeredAttendees-' .
            $event->getSlug() .
            '.csv';
        $writer = WriterFactory::create(Type::CSV);
        $response = new StreamedResponse(function () use (
            $writer,
            $data,
            $event,
            $connectionTraversor
        ) {
            $writer->openToFile('php://output');
            $writer->addRow(USER_HEADERS_EVENTS);
            $connectionTraversor->traverse(
                $data,
                'participants',
                function ($edge) use ($writer) {
                    $contributor = $edge['node'];
                    if (isset($contributor['id'])) {
                        $writer->addRow([
                            $contributor['id'],
                            $contributor['email'],
                            $contributor['username'],
                            $contributor['userType'] ? $contributor['userType']['name'] : null,
                            $edge['registeredAt'],
                            $edge['registeredAnonymously'] ? 'yes' : 'no',
                            $contributor['createdAt'],
                            $contributor['updatedAt'],
                            $contributor['lastLogin'],
                            $contributor['rolesText'],
                            $contributor['consentExternalCommunication'],
                            $contributor['enabled'],
                            $contributor['isEmailConfirmed'],
                            $contributor['locked'],
                            $contributor['phoneConfirmed'],
                            $contributor['gender'],
                            $contributor['dateOfBirth'],
                            $contributor['website'],
                            $contributor['biography'],
                            $contributor['address'],
                            $contributor['zipCode'],
                            $contributor['city'],
                            $contributor['phone'],
                            $contributor['url'],
                        ]);
                    } else {
                        $writer->addRow([
                            null,
                            $contributor['notRegisteredEmail'],
                            $contributor['username'],
                            null,
                            $edge['registeredAt'],
                            $edge['registeredAnonymously'] ? 'yes' : 'no',
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                        ]);
                    }
                },
                function ($pageInfo) use ($event) {
                    return $this->getEventContributorsGraphQLQuery(
                        $event->getId(),
                        $pageInfo['endCursor']
                    );
                }
            );
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $fileName . '"');

        return $response;
    }

    /**
     * @Route("/export-project-contributors/{projectId}", name="app_export_project_contributors")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadProjectContributorsAction(Project $project): StreamedResponse
    {
        $this->get(GraphQlAclListener::class)->disableAcl();
        $executor = $this->get('overblog_graphql.request_executor');
        $connectionTraversor = $this->get(ConnectionTraversor::class);

        $data = $executor
            ->execute('internal', [
                'query' => $this->getProjectContributorsGraphQLQuery($project->getId()),
                'variables' => [],
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['error']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }

        $fileName =
            (new \DateTime())->format('Y-m-d') . '_participants_' . $project->getSlug() . '.csv';
        $writer = WriterFactory::create(Type::CSV);

        $response = new StreamedResponse(function () use (
            $writer,
            $data,
            $project,
            $connectionTraversor
        ) {
            $writer->openToFile('php://output');
            $writer->addRow(USER_HEADERS);
            $connectionTraversor->traverse(
                $data,
                'contributors',
                function ($edge) use ($writer) {
                    $contributor = $edge['node'];
                    $writer->addRow([
                        $contributor['id'],
                        $contributor['email'],
                        $contributor['username'],
                        $contributor['userType'] ? $contributor['userType']['name'] : null,
                        $contributor['createdAt'],
                        $contributor['updatedAt'],
                        $contributor['lastLogin'],
                        $contributor['rolesText'],
                        $contributor['consentExternalCommunication'],
                        $contributor['enabled'],
                        $contributor['isEmailConfirmed'],
                        $contributor['locked'],
                        $contributor['phoneConfirmed'],
                        $contributor['gender'],
                        $contributor['dateOfBirth'],
                        $contributor['website'],
                        $contributor['biography'],
                        $contributor['address'],
                        $contributor['zipCode'],
                        $contributor['city'],
                        $contributor['phone'],
                        $contributor['url'],
                    ]);
                },
                function ($pageInfo) use ($project) {
                    return $this->getProjectContributorsGraphQLQuery(
                        $project->getId(),
                        $pageInfo['endCursor']
                    );
                }
            );
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $fileName . '"');

        return $response;
    }

    /**
     * @Route("/export-step-contributors/{stepId}", name="app_export_step_contributors")
     * @ParamConverter("step", options={"mapping": {"stepId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadStepContributorsAction(AbstractStep $step): StreamedResponse
    {
        $this->get(GraphQlAclListener::class)->disableAcl();
        $executor = $this->get('overblog_graphql.request_executor');
        $connectionTraversor = $this->get(ConnectionTraversor::class);

        $data = $executor
            ->execute('internal', [
                'query' => $this->getStepContributorsGraphQLQuery($step->getId()),
                'variables' => [],
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['error']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }
        $fileName =
            (new \DateTime())->format('Y-m-d') . '_participants_' . $step->getSlug() . '.csv';
        $writer = WriterFactory::create(Type::CSV);

        $response = new StreamedResponse(function () use (
            $writer,
            $data,
            $connectionTraversor,
            $step
        ) {
            $writer->openToFile('php://output');
            $writer->addRow(USER_HEADERS);
            $connectionTraversor->traverse(
                $data,
                'contributors',
                function ($edge) use ($writer) {
                    $contributor = $edge['node'];
                    $writer->addRow([
                        $contributor['id'],
                        $contributor['email'],
                        $contributor['username'],
                        $contributor['userType'] ? $contributor['userType']['name'] : null,
                        $contributor['createdAt'],
                        $contributor['updatedAt'],
                        $contributor['lastLogin'],
                        $contributor['rolesText'],
                        $contributor['consentExternalCommunication'],
                        $contributor['enabled'],
                        $contributor['isEmailConfirmed'],
                        $contributor['locked'],
                        $contributor['phoneConfirmed'],
                        $contributor['gender'],
                        $contributor['dateOfBirth'],
                        $contributor['website'],
                        $contributor['biography'],
                        $contributor['address'],
                        $contributor['zipCode'],
                        $contributor['city'],
                        $contributor['phone'],
                        $contributor['url'],
                    ]);
                },
                function ($pageInfo) use ($step) {
                    return $this->getStepContributorsGraphQLQuery(
                        $step->getId(),
                        $pageInfo['endCursor']
                    );
                }
            );
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $fileName . '"');

        return $response;
    }

    /**
     * @Route("/export-events-list", name="app_export_event_list")
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadExportEventListction(): StreamedResponse
    {
        $this->get(GraphQlAclListener::class)->disableAcl();
        $executor = $this->get('overblog_graphql.request_executor');
        $connectionTraversor = $this->get(ConnectionTraversor::class);

        $data = $executor
            ->execute('internal', [
                'query' => $this->getEventsGraphQLQuery(),
                'variables' => [],
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['error']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }

        $fileName = (new \DateTime())->format('Y-m-d-h-i-s_') . 'events.csv';
        $writer = WriterFactory::create(Type::CSV);

        $response = new StreamedResponse(function () use ($writer, $data, $connectionTraversor) {
            $writer->openToFile('php://output');
            $writer->addRow(EVENTS_HEADERS);
            $connectionTraversor->traverse(
                $data,
                'events',
                function ($edge) use ($writer) {
                    $event = $edge['node'];
                    $writer->addRow([
                        $event['title'],
                        $event['body'],
                        $event['media'] ? $event['media']['id'] : null,
                        $event['media'] ? $event['media']['url'] : null,
                        $event['author'] ? $event['author']['id'] : null,
                        $event['author'] ? $event['author']['email'] : null,
                        $event['createdAt'],
                        $event['updatedAt'],
                        $event['enabled'],
                        $event['startAt'],
                        $event['endAt'],
                        $event['zipCode'],
                        $event['address'],
                        $event['city'],
                        $event['country'],
                        $event['lat'],
                        $event['lng'],
                        $event['link'],
                        $event['registrationEnable'],
                        $event['comments'] ? $event['comments']['totalCount'] : null,
                        $event['commentable'],
                        $event['metaDescription'],
                        $event['customCode'],
                    ]);
                },
                function ($pageInfo) {
                    return $this->getEventsGraphQLQuery($pageInfo['endCursor']);
                }
            );
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $fileName . '"');

        return $response;
    }

    private function getProjectContributorsGraphQLQuery(
        string $projectId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        $USER_FRAGMENT = USER_FRAGMENT;

        return <<<EOF
        query {
          node(id: "${projectId}") {
            ... on Project {
              contributors(first: 50  ${userCursor}) {
                edges {
                  cursor
                  node {
                   ${USER_FRAGMENT}
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
              }
            }
          }
        }
EOF;
    }

    private function getEventsGraphQLQuery(?string $userCursor = null): string
    {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        return <<<EOF
        {
          events(first: 50 ${userCursor}) {
            totalCount
            pageInfo {
              startCursor
              endCursor
              hasNextPage
            }
            edges {
              cursor  
              node {
                title
                body
                media {
                  id
                  url
                }
                author {
                  id
                  email
                }
                createdAt
                updatedAt
                enabled
                startAt
                endAt
                zipCode
                address
                city
                country
                lat
                lng
                link
                registrationEnable
                comments {
                  totalCount
                }
                commentable
                metaDescription
                customCode
              }
            }
          }
        }
EOF;
    }

    private function getEventContributorsGraphQLQuery(
        string $eventId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        $eventId = GlobalId::toGlobalId('Event', $eventId);
        $USER_FRAGMENT = USER_FRAGMENT;

        return <<<EOF
        query {
          node(id: "${eventId}") {
            ... on Event {
              participants(first: 50 ${userCursor}) {
                edges {
                  cursor
                  registeredAt
                  registeredAnonymously
                  node { 
                    ... on User {
                        ${USER_FRAGMENT}
                    }
                    ... on NotRegistered {
                      username
                      notRegisteredEmail: email
                    }
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
              }
            }
          }
        }
EOF;
    }

    private function getStepContributorsGraphQLQuery(
        string $stepId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }
        $USER_FRAGMENT = USER_FRAGMENT;

        return <<<EOF
        query {
          node(id: "${stepId}") {
            ... on Consultation {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor
                  node {
                    ${USER_FRAGMENT}
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
              }
            }
            ... on CollectStep {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor   
                  node {
                    ${USER_FRAGMENT}
                  }              
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }                
              }
            }
            ... on SelectionStep {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor
                  node {
                    ${USER_FRAGMENT}
                  }               
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }                
              }
            }
            ... on QuestionnaireStep {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor
                  node {
                    ${USER_FRAGMENT}
                  }              
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }                
              }
            }
          }
        }
EOF;
    }
}
