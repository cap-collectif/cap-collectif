<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Toggle\Manager;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AdminInterface;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class StepAdmin extends CapcoAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected $formOptions = ['cascade_validation' => true];

    protected $labels = [
        PresentationStep::class => 'proposal.tabs.content',
        SynthesisStep::class => 'global.synthesis',
        QuestionnaireStep::class => 'global.questionnaire',
        OtherStep::class => '',
        ConsultationStep::class => 'global.consultation',
        RankingStep::class => 'admin.fields.project.group_ranking',
        SelectionStep::class => '',
        CollectStep::class => 'global.collect.step.label'
    ];

    public function getNewInstance()
    {
        $subClass = $this->getRequest()->query->get('subclass');
        // Workaround for proposals autocompletion
        $subClass = $subClass ?: 'selection_step';
        $object = $this->getModelManager()->getModelInstance($this->getSubClass($subClass));

        foreach ($this->getExtensions() as $extension) {
            $extension->alterNewInstance($this, $object);
        }

        return $object;
    }

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $projectId = null;

        if ($subject && $subject->getProject()) {
            $project = $subject->getProject();
            if ($project) {
                $projectId = $project->getId();
            }
        } else {
            $projectId = $this->getRequest()->get('projectId');
        }

        return ['projectId' => $projectId];
    }

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Step:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureDatagridFilters(DatagridMapper $filter)
    {
        $filter->add('title', null, ['label' => 'global.title']);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();
        $translator = $this->getTranslator();
        $label = $this->getLabelKey($subject);
        $title = empty($subject->getTitle()) ? $translator->trans($label) : $subject->getTitle();
        $formMapper
            ->with('admin.fields.step.group_general')
            ->add('title', null, [
                'label' => 'admin.fields.step.label',
                'data' => $title,
                'required' => true
            ])
            ->add('label', null, [
                'label' => 'color.main_menu.text',
                'data' => $translator->trans($label),
                'required' => true
            ]);

        $formMapper->add('isEnabled', null, [
            'label' => 'global.published',
            'required' => false
        ]);

        if ($subject instanceof ParticipativeStepInterface) {
            $formMapper->add('timeless', CheckboxType::class, [
                'label' => 'admin.fields.step.timeless',
                'required' => false
            ]);
        }
        if (!$subject instanceof PresentationStep) {
            $formMapper
                ->add('startAt', 'sonata_type_datetime_picker', [
                    'label' => 'admin.fields.event.start_at',
                    'format' => 'dd/MM/yyyy HH:mm',
                    'dp_use_current' => false,
                    'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm'],
                    'required' => false
                ])
                ->add('endAt', 'sonata_type_datetime_picker', [
                    'label' => 'admin.fields.event.end_at',
                    'format' => 'dd/MM/yyyy HH:mm',
                    'dp_use_current' => false,
                    'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm'],
                    'required' => false
                ]);
        }

        if (
            $subject instanceof PresentationStep ||
            $subject instanceof OtherStep ||
            $subject instanceof CollectStep ||
            $subject instanceof QuestionnaireStep
        ) {
            $formMapper->add('body', CKEditorType::class, [
                'config_name' => 'admin_editor',
                'label' => 'admin.fields.step.body',
                'required' => false
            ]);
        }

        if ($subject instanceof ConsultationStep) {
            $formMapper
                ->getFormBuilder()
                ->addEventListener(FormEvents::SUBMIT, static function (FormEvent $event) {
                    // We get the order from the submitted data from user
                    /** @var Consultation[] $normalizedConsultations */
                    $normalizedConsultations = $event
                        ->getForm()
                        ->get('consultations')
                        ->getNormData();
                    /** @var ConsultationStep $step */
                    $step = $event->getData();
                    $position = 1;
                    foreach ($normalizedConsultations as $normalizedConsultation) {
                        // And we set in the backend the correct position for the consultation, based on the user order
                        $consultation = $step
                            ->getConsultations()
                            ->filter(static function (Consultation $c) use (
                                $normalizedConsultation
                            ) {
                                return $c->getId() === $normalizedConsultation->getId();
                            })
                            ->first();
                        /** @var Consultation $consultation */
                        if ($consultation) {
                            $consultation->setPosition($position);
                        }
                        ++$position;
                    }
                });
            $formMapper
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false
                ])
                ->add('consultations', ModelAutocompleteType::class, [
                    'multiple' => true,
                    'property' => 'title',
                    'to_string_callback' => static function (Consultation $entity) {
                        return $entity->getTitle();
                    },
                    'callback' => static function (AdminInterface $admin, $property, $value) {
                        $datagrid = $admin->getDatagrid();
                        $queryBuilder = $datagrid->getQuery();
                        $queryBuilder
                            ->leftJoin($queryBuilder->getRootAlias() . '.step', 's')
                            ->andWhere(
                                $queryBuilder->getRootAlias() . '.step IS NULL OR s.id = :stepId'
                            )
                            ->setParameter('stepId', $admin->getRequest()->get('stepId'))
                        ;
                        $datagrid->setValue($property, null, $value);
                    },
                    'req_params' => ['subclass' => 'global.consultation', 'stepId' => $subject->getId()],
                    'label' => 'one-or-more-consultation-step',
                    'by_reference' => false,
                    'required' => false
                ])
                ->end()
                ->with('requirements')
                ->add(
                    'requirements',
                    'sonata_type_collection',
                    ['label' => 'fields', 'by_reference' => false],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->add('requirementsReason', TextareaType::class, [
                    'translation_domain' => 'CapcoAppBundle',
                    'label' => 'reason-for-collection',
                    'required' => false,
                    'help' => 'help-text-for-reason-for-collection-field',
                    'purify_html' => true,
                    'purify_html_profile' => 'default'
                ])
                ->end();
        } elseif ($subject instanceof SynthesisStep) {
            $formMapper
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false
                ])
                ->add(
                    'synthesis',
                    'sonata_type_admin',
                    ['label' => 'global.synthesis', 'required' => true],
                    ['link_parameters' => ['projectId']]
                );
        } elseif ($subject instanceof RankingStep) {
            $formMapper
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false
                ])
                ->add('nbOpinionsToDisplay', null, [
                    'label' => 'admin.fields.step.nb_opinions_to_display',
                    'required' => true
                ])
                ->add('nbVersionsToDisplay', null, [
                    'label' => 'admin.fields.step.nb_versions_to_display',
                    'required' => true
                ]);
        } elseif ($subject instanceof SelectionStep) {
            $formMapper
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false
                ])
                ->add('allowingProgressSteps', null, [
                    'label' => 'admin.fields.step.allowingProgressSteps',
                    'required' => false
                ]);
        }

        if ($subject instanceof QuestionnaireStep) {
            $formMapper->add('footer', CKEditorType::class, [
                'config_name' => 'admin_editor',
                'label' => 'global.footer',
                'required' => false,
                'translation_domain' => 'CapcoAppBundle'
            ]);
            if (
                $this->getConfigurationPool()
                    ->getContainer()
                    ->get(Manager::class)
                    ->isActive('phone_confirmation')
            ) {
                $formMapper->add('verification', 'choice', [
                    'label' => 'admin.fields.step.verification',
                    'choices' => QuestionnaireStep::$verificationLabels,
                    'translation_domain' => 'CapcoAppBundle'
                ]);
            }
        }

        $formMapper->end();

        if ($subject instanceof SelectionStep || $subject instanceof CollectStep) {
            $formMapper
                ->with('global.vote')
                ->add('voteType', 'choice', [
                    'label' => 'vote.type',
                    'choices' => SelectionStep::getVoteTypeLabels(),
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => true,
                    'help' => 'admin.help.step.vote_type'
                ])
                ->add('votesLimit', IntegerType::class, [
                    'label' => 'admin.fields.step.votesLimit',
                    'required' => false
                ])
                ->add('hasVoteThreshold', CheckboxType::class, [
                    'label' => 'admin.fields.step.vote_threshold.checkbox',
                    'required' => false,
                    'mapped' => false,
                    'data' => $subject->hasVoteThreshold()
                ])
                ->add('voteThreshold', IntegerType::class, [
                    'label' => 'admin.fields.step.vote_threshold.input',
                    'required' => false,
                    'attr' => ['style' => 'width: 200px;']
                ])
                ->add('budget', 'money', [
                    'currency' => 'EUR',
                    'label' => 'admin.fields.step.budget',
                    'required' => false
                ])
                ->add('votesRanking', null, [
                    'label' => 'activate-vote-ranking',
                    'required' => false,
                    'help' => 'ranking-votes-help-text'
                ])
                ->add('votesHelpText', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.votesHelpText',
                    'required' => false
                ])
                ->end();
            $formMapper
                ->with('admin.fields.step.group_statuses')
                ->add(
                    'statuses',
                    'sonata_type_collection',
                    ['label' => 'admin.fields.step.group_statuses', 'by_reference' => false],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->end();
            $formMapper
                ->with('requirements')
                ->add(
                    'requirements',
                    'sonata_type_collection',
                    ['label' => 'fields', 'by_reference' => false],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->add('requirementsReason', TextareaType::class, [
                    'translation_domain' => 'CapcoAppBundle',
                    'label' => 'reason-for-collection',
                    'required' => false,
                    'help' => 'help-text-for-reason-for-collection-field',
                    'purify_html' => true,
                    'purify_html_profile' => 'default'
                ])
                ->end();
            if ($subject instanceof CollectStep) {
                $formMapper->add('defaultStatus', 'sonata_type_model', [
                    'label' => 'admin.fields.step.default_status',
                    'query' => $this->createQueryForDefaultStatus(),
                    'by_reference' => false,
                    'required' => false,
                    'btn_add' => false,
                    'class' => Status::class,
                    'placeholder' => 'global.none',
                    'choices_as_values' => true
                ]);
                $formMapper->end();
                $formMapper
                    ->with('admin.fields.step.group_selections')
                    ->add('private', CheckboxType::class, [
                        'label' => 'admin.fields.step.private',
                        'required' => false
                    ])
                    ->add('defaultSort', 'choice', [
                        'label' => 'admin.fields.step.default_sort',
                        'choices' => CollectStep::$sortLabels,
                        'translation_domain' => 'CapcoAppBundle',
                        'required' => true
                    ]);
            }
            $formMapper->end();
        }

        if ($subject instanceof SelectionStep) {
            $formMapper
                ->with('admin.fields.step.group_selections')
                ->add('proposalsHidden', CheckboxType::class, [
                    'label' => 'admin.fields.step.proposals_hidden',
                    'required' => false
                ])
                ->add('defaultSort', 'choice', [
                    'label' => 'admin.fields.step.default_sort',
                    'choices' => SelectionStep::$sortLabels,
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => true
                ])
                ->end();
        }

        if ($subject instanceof CollectStep) {
            $formMapper
                ->with('admin.fields.step.group_form')
                ->add('proposalForm', 'sonata_type_model', [
                    'label' => 'global.formulaire',
                    'query' => $this->createQueryForProposalForms(),
                    'by_reference' => false,
                    'required' => false,
                    'placeholder' => 'admin.fields.step.no_proposal_form',
                    'choices_as_values' => true
                ])
                ->end()
                ->with('admin.fields.step.group_statuses')
                ->add(
                    'statuses',
                    'sonata_type_collection',
                    [
                        'label' => 'admin.fields.step.group_statuses',
                        'by_reference' => false,
                        'required' => false
                    ],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->end();
        }

        if ($subject instanceof QuestionnaireStep) {
            $formMapper
                ->with('admin.fields.step.group_form')
                ->add('questionnaire', 'sonata_type_model', [
                    'label' => 'global.questionnaire',
                    'query' => $this->createQueryForQuestionnaires(),
                    'required' => false,
                    'placeholder' => 'admin.fields.step.no_questionnaire',
                    'choices_as_values' => true
                ])
                ->end();
        }
        $formMapper
            ->with('admin.fields.step.advanced')
            ->add('metaDescription', null, [
                'label' => 'global.meta.description',
                'required' => false,
                'help' => 'admin.help.metadescription'
            ])
            ->add('customCode', null, [
                'label' => 'admin.customcode',
                'required' => false,
                'help' => 'admin.help.customcode',
                'attr' => [
                    'rows' => 10,
                    'placeholder' => '<script type="text/javascript"> </script>'
                ]
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    private function createQueryForProposalForms()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(ProposalFormRepository::class)
            ->createQueryBuilder('f')
            ->where('f.step IS NULL OR f.step = :step')
            ->setParameter('step', $subject);

        return $qb->getQuery();
    }

    private function createQueryForQuestionnaires()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(QuestionnaireRepository::class)
            ->createQueryBuilder('q')
            ->where('q.step IS NULL OR q.step = :step')
            ->setParameter('step', $subject);

        return $qb->getQuery();
    }

    private function createQueryForDefaultStatus()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(StatusRepository::class)
            ->createQueryBuilder('s')
            ->where('s.step = :step')
            ->setParameter('step', $subject);

        return $qb->getQuery();
    }

    private function getLabelKey(AbstractStep $step): string
    {
        if (!empty($step->getLabel())) {
            return $step->getLabel();
        }

        foreach ($this->labels as $class => $label) {
            if ($step instanceof $class) {
                return $label;
            }
        }

        return '';
    }
}
