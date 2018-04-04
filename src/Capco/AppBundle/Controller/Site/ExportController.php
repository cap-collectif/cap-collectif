<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\GraphQLToCsv;
use League\Csv\Writer;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ExportController extends Controller
{
    /**
     * @Route("/export-event-participants/{eventId}", name="app_export_event_participants")
     * @ParamConverter("event", options={"mapping": {"eventId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadEventParticipantsAction(Event $event, Request $request)
    {
        // $csvGenerator = new GraphQLToCsv($this->get('logger'));
        $requestString = '
query {
  node(id: "' . $event->getId() . '") {
    ... on Event {
      participants(first: 1000) {
        edges {
          node {
            ... on User {
              id
            }
            ... on NotRegistred {
              username
              email
            }
          }
        }
      }
    }
  }
}';

        $writer = Writer::createFromStream(fopen('php://temp', 'r+'));
        // $writer->setDelimiter(',');
        // $writer->setNewline("\r\n");
        // $writer->setOutputBOM(Writer::BOM_UTF8);
        // $csvGenerator->generate(
        //     $requestString,
        //     $this->get('overblog_graphql.request_executor'),
        //     $writer
        // );

        // if (TYPE::XLSX === $_format) {
        //     $contentType = 'application/vnd.ms-excel';
        // }

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');

        // {date de l'export}-registeredAttendees-{nom de l'évènement}
        $fileName = (new \DateTime())->format('ll') . '-registeredAttendees-' . $event->getTitle() . '.csv';

        return $this->createResponse($writer, $fileName);
    }

    private function createResponse($writer, $fileName, $contentType = 'text/csv')
    {
        $response = new Response($writer->getContent());
        $disposition = $response->headers->makeDisposition(
          ResponseHeaderBag::DISPOSITION_ATTACHMENT,
          $filename
      );

        $response->headers->set('Content-Disposition', $disposition);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }
}
