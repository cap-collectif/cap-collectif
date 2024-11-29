<?php

namespace Capco\AppBundle\Processor\District;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Notifier\GlobalDistrictFollowerNotifier;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class GlobalDistrictNotificationProcessor implements ProcessorInterface
{
    private readonly GlobalDistrictRepository $globalDistrictRepository;
    private readonly ProjectRepository $projectRepository;
    private readonly GlobalDistrictFollowerNotifier $notifier;

    public function __construct(
        GlobalDistrictRepository $globalDistrictRepository,
        ProjectRepository $projectRepository,
        GlobalDistrictFollowerNotifier $notifier
    ) {
        $this->globalDistrictRepository = $globalDistrictRepository;
        $this->projectRepository = $projectRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $project = $this->projectRepository->find($json['projectId']);
        if (!$project instanceof Project) {
            throw new \RuntimeException('Unable to find project with id : ' . $json['projectId']);
        }
        $district = $this->globalDistrictRepository->find($json['globalDistrict']);
        if (!$district instanceof GlobalDistrict) {
            throw new \RuntimeException('Unable to find district with id : ' . $json['globalDistrict']);
        }

        $this->notifier->onNewProjectInDistrict($district, $project);

        return true;
    }
}
