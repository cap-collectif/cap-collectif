<?php
namespace Capco\AppBundle\Controller\Site;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Capco\AppBundle\EventListener\GraphQlAclListener;

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
  show_url
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

class ExportController extends Controller
{
    /**
     * @Route("/export-event-participants/{eventId}", name="app_export_event_participants")
     * @ParamConverter("event", options={"mapping": {"eventId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadEventParticipantsAction(
        Event $event,
        Request $request
    ): StreamedResponse {
        $requestString =
            '
query {
  node(id: "' .
            $event->getId() .
            '") {
    ... on Event {
      participants(first: 1000) {
        edges {
          registeredAt
          registeredAnonymously
          node {
            ... on User {
              ' .
            USER_FRAGMENT .
            '
            }
            ... on NotRegistered {
              username
              notRegisteredEmail: email
            }
          }
        }
      }
    }
  }
}';

        $this->get(GraphQlAclListener::class)->disableAcl();
        $executor = $this->get('overblog_graphql.request_executor');

        $data = $executor
            ->execute('internal', ['query' => $requestString, 'variables' => []])
            ->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['error']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }

        $fileName =
            (new \DateTime())->format('Y-m-d') .
            '-registeredAttendees-' .
            $event->getSlug() .
            '.csv';

        $writer = WriterFactory::create(Type::CSV);

        $response = new StreamedResponse(function () use ($writer, $data) {
            $writer->openToFile('php://output');
            $writer->addRow([
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
            ]);
            foreach ($data['data']['node']['participants']['edges'] as $edge) {
                $participant = $edge['node'];
                if (isset($participant['id'])) {
                    $writer->addRow([
                        $participant['id'],
                        $participant['email'],
                        $participant['username'],
                        $participant['userType'] ? $participant['userType']['name'] : null,
                        $edge['registeredAt'],
                        $edge['registeredAnonymously'] ? 'yes' : 'no',
                        $participant['createdAt'],
                        $participant['updatedAt'],
                        $participant['lastLogin'],
                        $participant['rolesText'],
                        $participant['consentExternalCommunication'],
                        $participant['enabled'],
                        $participant['isEmailConfirmed'],
                        $participant['locked'],
                        $participant['phoneConfirmed'],
                        $participant['gender'],
                        $participant['dateOfBirth'],
                        $participant['website'],
                        $participant['biography'],
                        $participant['address'],
                        $participant['zipCode'],
                        $participant['city'],
                        $participant['phone'],
                        $participant['show_url'],
                    ]);
                } else {
                    $writer->addRow([
                        null,
                        $participant['notRegisteredEmail'],
                        $participant['username'],
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
            }
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
    public function downloadProjectContributorsAction(
        Project $project,
        Request $request
    ): StreamedResponse {
        $requestString =
            '
query {
  node(id: "' .
            $project->getId() .
            '") {
    ... on Project {
      contributors(first: 1000) {
        edges {
          node {
            ' .
            USER_FRAGMENT .
            '
          }
        }
      }
    }
  }
}';
        $this->get(GraphQlAclListener::class)->disableAcl();
        $executor = $this->get('overblog_graphql.request_executor');

        $data = $executor
            ->execute('internal', ['query' => $requestString, 'variables' => []])
            ->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['error']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }

        $fileName =
            (new \DateTime())->format('Y-m-d') . '_participants_' . $project->getSlug() . '.csv';
        $writer = WriterFactory::create(Type::CSV);

        $response = new StreamedResponse(function () use ($writer, $data) {
            $writer->openToFile('php://output');
            $writer->addRow(USER_HEADERS);
            foreach ($data['data']['node']['contributors']['edges'] as $edge) {
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
                    $contributor['show_url'],
                ]);
            }
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
    public function downloadStepContributorsAction(
        AbstractStep $step,
        Request $request
    ): StreamedResponse {
        $requestString =
            '
query {
  node(id: "' .
            $step->getId() .
            '") {
    ... on Consultation {
      contributors(first: 1000) {
        edges {
          node {
            ' .
            USER_FRAGMENT .
            '
          }
        }
      }
    }
    ... on CollectStep {
      contributors(first: 1000) {
        edges {
          node {
            ' .
            USER_FRAGMENT .
            '
          }
        }
      }
    }
    ... on SelectionStep {
      contributors(first: 1000) {
        edges {
          node {
            ' .
            USER_FRAGMENT .
            '
          }
        }
      }
    }
    ... on QuestionnaireStep {
      contributors(first: 1000) {
        edges {
          node {
            ' .
            USER_FRAGMENT .
            '
          }
        }
      }
    }
  }
}';
        $this->get(GraphQlAclListener::class)->disableAcl();
        $executor = $this->get('overblog_graphql.request_executor');

        $data = $executor
            ->execute('internal', ['query' => $requestString, 'variables' => []])
            ->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['error']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }

        $fileName =
            (new \DateTime())->format('Y-m-d') . '_participants_' . $step->getSlug() . '.csv';
        $writer = WriterFactory::create(Type::CSV);

        $response = new StreamedResponse(function () use ($writer, $data) {
            $writer->openToFile('php://output');
            $writer->addRow(USER_HEADERS);
            foreach ($data['data']['node']['contributors']['edges'] as $edge) {
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
                    $contributor['show_url'],
                ]);
            }
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $fileName . '"');

        return $response;
    }
}
