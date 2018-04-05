<?php

namespace Capco\AppBundle\Controller\Site;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\Entity\Event;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * @Route("/export-event-participants/{eventId}", name="app_export_event_participants")
     * @ParamConverter("event", options={"mapping": {"eventId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadEventParticipantsAction(Event $event, Request $request)
    {
        $requestString = '
query {
  node(id: "' . $event->getId() . '") {
    ... on Event {
      participants(first: 1000) {
        edges {
          registredAt
          registredAnonymously
          node {
            ... on User {
              id
              email
              username
              userType {
                name
              }
              createdAt
              updatedAt
            }
            ... on NotRegistred {
              username
              notRegistredEmail: email
            }
          }
        }
      }
    }
  }
}';

        // expired
        // lastLogin
        // rolesText
        // consentExternalCommunication
        // enabled
        // locked
        // phoneConfirmed
        // phoneConfirmationSentAt
        // gender
        // firstName
        // lastName
        // dateOfBirth
        // websiteUrl
        // biography
        // address
        // zipCode
        // city
        // phone
        // profileUrl
        $executor = $this->get('overblog_graphql.request_executor');

        $data = $executor->execute([
          'query' => $requestString,
          'variables' => [],
        ])->toArray();

        if (!isset($data['data'])) {
            $this->get('logger')->error('GraphQL Query Error: ' . $data['error']);
            $this->get('logger')->info('GraphQL query: ' . json_encode($data));
        }

        $fileName = (new \DateTime())->format('Y-m-d H:i:s') . '-registeredAttendees-' . $event->getSlug() . '.csv';

        $writer = WriterFactory::create(Type::CSV);

        $response = new StreamedResponse(function () use ($writer, $data) {
            $writer->openToFile('php://output');
            $writer->addRow(['user_id', 'user_email', 'user_userName', 'user_TypeName', 'event_RegisteredOn', 'event_privateRegistration', 'user_createdAt', 'user_updatedAt']);
            foreach ($data['data']['node']['participants']['edges'] as $edge) {
                $participant = $edge['node'];
                if (isset($participant['id'])) {
                    $writer->addRow([$participant['id'], $participant['email'], $participant['username'], $participant['userType'] ? $participant['userType']['name'] : null, $edge['registredAt'], $edge['registredAnonymously'], $participant['createdAt'], $participant['updatedAt']]);
                } else {
                    $writer->addRow([null, $participant['notRegistredEmail'], $participant['username'], null, $edge['registredAt'], $edge['registredAnonymously'], null, null]);
                }
            }
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $fileName . '"');

        return $response;
    }
}
