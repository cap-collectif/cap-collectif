<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Service\MediaAccessResolver;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;

class PrivateMediaSubscriber implements EventSubscriberInterface
{
    public function getSubscribedEvents(): array
    {
        return [Events::onFlush];
    }

    public function onFlush(OnFlushEventArgs $event): void
    {
        $em = $event->getEntityManager();
        $uow = $em->getUnitOfWork();
        $responses = [...$uow->getScheduledEntityInsertions(), ...$uow->getScheduledEntityUpdates(), ...$uow->getScheduledEntityDeletions()];
        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof MediaQuestion && (true === ($uow->getEntityChangeSet($entity)['private'][1] ?? false)
                || true === ($uow->getEntityChangeSet($entity)['hidden'][1] ?? false))) {
                $responses = [...$responses, ...$em->getRepository(MediaResponse::class)->findBy(['question' => $entity])];
            }
        }
        foreach ([...$uow->getScheduledCollectionUpdates(), ...$uow->getScheduledCollectionDeletions()] as $collection) {
            $responses[] = $collection->getOwner();
        }
        $responseIds = [];
        $medias = [];
        foreach ($responses as $response) {
            if (!$response instanceof MediaResponse || !MediaAccessResolver::isPrivateResponse($response)) {
                continue;
            }
            $responseIds[$response->getId()] = $response->getId();
            foreach ($response->getMedias() as $media) {
                $medias[] = $media;
            }
        }
        if ($responseIds) {
            // A cleared or replaced collection may have already lost its snapshot.
            $previousMedias = $em->createQuery('SELECT m FROM ' . Media::class . ' m WHERE m.id IN (
                SELECT attached.id FROM ' . MediaResponse::class . ' response JOIN response.medias attached WHERE response.id IN (:responses)
            )')->setParameter('responses', array_values($responseIds))->getResult();
            $medias = [...$medias, ...$previousMedias];
        }
        foreach ($medias as $media) {
            if ('1' !== $media->getMetadataValue(MediaAccessResolver::PRIVATE_ATTACHMENT)) {
                $media->setMetadataValue(MediaAccessResolver::PRIVATE_ATTACHMENT, '1');
                $uow->recomputeSingleEntityChangeSet($em->getClassMetadata(Media::class), $media);
            }
        }
    }
}
