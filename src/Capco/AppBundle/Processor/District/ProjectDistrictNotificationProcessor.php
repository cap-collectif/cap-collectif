<?php

namespace Capco\AppBundle\Processor\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Notifier\ProjectDistrictFollowerNotifier;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProjectDistrictNotificationProcessor implements ProcessorInterface
{
    private ProjectDistrictRepository $projectDistrictRepository;
    private ProjectRepository $projectRepository;
    private ProjectDistrictFollowerNotifier $notifier;

    public function __construct(
        ProjectDistrictRepository $projectDistrictRepository,
        ProjectRepository $projectRepository,
        ProjectDistrictFollowerNotifier $notifier
    ) {
        $this->projectDistrictRepository = $projectDistrictRepository;
        $this->projectRepository = $projectRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $project = $this->projectRepository->find($json['projectId']);
        if (!$project instanceof Project) {
            throw new \RuntimeException('Unable to find project with id : ' . $json['projectId']);
        }
        $district = $this->projectDistrictRepository->find($json['projectDistrict']);
        if (!$district instanceof ProjectDistrict) {
            throw new \RuntimeException(
                'Unable to find district with id : ' . $json['projectDistrict']
            );
        }

        $this->notifier->onNewProjectInDistrict($district, $project);

        return true;
    }
}
