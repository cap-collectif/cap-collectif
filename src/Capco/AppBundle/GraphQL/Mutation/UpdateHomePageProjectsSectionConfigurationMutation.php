<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Form\SectionType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateHomePageProjectsSectionConfigurationMutation implements MutationInterface
{
    public const TOO_MANY_PROJECTS = 'TOO_MANY_PROJECTS';
    private EntityManagerInterface $em;
    private SectionRepository $sectionRepository;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private Manager $manager;

    public function __construct(
        EntityManagerInterface $em,
        SectionRepository $sectionRepository,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        Manager $manager
    ) {
        $this->em = $em;
        $this->sectionRepository = $sectionRepository;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->manager = $manager;
    }

    public function __invoke(Argument $args): array
    {
        /**
         * @var $section Section
         */
        $section = $this->sectionRepository->findOneBy(['type' => 'projects']);

        list($nbObjects, $projects) = [$args->offsetGet('nbObjects'), $args->offsetGet('projects')];

        $arguments = $args->getArrayCopy();

        $sectionProjectsFormInput = [];
        foreach ($projects as $index => $projectId) {
            $sectionProjectsFormInput[] = [
                'section' => $section->getId(),
                'project' => $projectId,
                'position' => $index,
            ];
        }

        unset($arguments['projects']);
        $arguments['sectionProjects'] = $sectionProjectsFormInput;
        LocaleUtils::indexTranslations($arguments);

        $maxProjectsDisplay =
            true === $this->manager->isActive(Manager::unstable__new_project_card) ? 9 : 8;

        if ($nbObjects > $maxProjectsDisplay) {
            return [
                'homePageProjectsSectionConfiguration' => null,
                'errorCode' => self::TOO_MANY_PROJECTS,
            ];
        }

        $form = $this->formFactory->create(SectionType::class, $section);

        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($section);
        $this->em->flush();

        return ['homePageProjectsSectionConfiguration' => $section, 'errorCode' => null];
    }
}
