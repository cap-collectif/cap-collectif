<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class ConsultationAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    ];

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Consultation:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.consultation.title'
            ])
            ->add('opinionTypes', null, [
                'label' => 'admin.fields.consultation.opinion_types'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.consultation.updated_at'
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.consultation.created_at'
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.consultation.title'
            ])
            ->add('step', null, [
                'label' => 'admin.fields.consultation.step'
            ])
            ->add('opinionTypes', 'sonata_type_model', [
                'label' => 'admin.fields.consultation.opinion_types'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.consultation.updated_at'
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => []
                ]
            ]);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper->with('admin.fields.step.group_general')->add('title', null, [
            'label' => 'admin.fields.consultation.title'
        ]);
        if ($this->getSubject()->getId()) {
            $formMapper
                ->getFormBuilder()
                ->addEventListener(FormEvents::SUBMIT, static function (FormEvent $event) {
                    /** @var ConsultationStep|null $step */
                    $step = $event
                        ->getForm()
                        ->get('step')
                        ->getNormData();
                    /** @var Consultation $consultation */
                    $consultation = $event->getData();
                    if ($step && ($last = $step->getConsultations()->last())) {
                        $consultation->setPosition($last->getPosition() + 1);
                    } else {
                        $consultation->setPosition(1);
                    }
                });
            $formMapper
                ->add('description', CKEditorType::class, [
                    'label' => 'proposal.description',
                    'config_name' => 'admin_editor',
                    'required' => false
                ])
                ->add(
                    'illustration',
                    ModelListType::class,
                    [
                        'required' => false,
                        'label' => 'illustration',
                        'help' => 'help-text-description-step'
                    ],
                    [
                        'link_parameters' => [
                            'context' => 'default',
                            'hide_context' => true,
                            'provider' => 'sonata.media.provider.image'
                        ]
                    ]
                )
                ->add('step', null, [
                    'label' => 'admin.label.step',
                    'required' => false
                ]);
        }
        $formMapper->end();
        if ($this->getSubject()->getId()) {
            $formMapper
                ->with('plan-consultation')
                ->add('opinionCountShownBySection', null, [
                    'label' => 'admin.fields.step.opinionCountShownBySection',
                    'required' => true
                ])
                ->add('opinionTypes', ModelType::class, [
                    'label' => 'admin.fields.consultation.opinion_types',
                    'query' => $this->createQueryForOpinionTypes(),
                    'by_reference' => false,
                    'multiple' => true,
                    'expanded' => true,
                    'required' => true,
                    'tree' => true,
                    'choices_as_values' => true,
                    'disabled' => true
                ])
                ->end()
                ->with('submission-of-proposals')
                ->add('titleHelpText', null, [
                    'label' => 'admin.fields.proposal_form.title_help_text',
                    'required' => false,
                    'help' => 'admin.fields.proposal_form.help_text_title_help_text'
                ])
                ->add('descriptionHelpText', null, [
                    'label' => 'admin.fields.proposal_form.description_help_text',
                    'required' => false,
                    'help' => 'admin.fields.proposal_form.help_text_description_help_text'
                ])
                ->end()
                ->with('admin.label.settings.notifications', [
                    'description' => 'receive-email-notification-when-a-contribution-is'
                ])
                ->add('moderatingOnReport', 'checkbox', [
                    'label' => 'reported',
                    'mapped' => false,
                    'value' => true,
                    'disabled' => true,
                    'attr' => ['readonly' => true, 'checked' => true]
                ])
                ->add('moderatingOnCreate', null, ['label' => 'admin.fields.synthesis.enabled'])
                ->add('moderatingOnUpdate', null, [
                    'label' => 'admin.fields.proposal_form.notification.on_update'
                ])
                ->end()
                ->with('admin.fields.step.advanced')
                ->add('metaDescription', null, [
                    'label' => 'projects.metadescription',
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
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.consultation.title'
            ])
            ->add('opinionTypes', null, [
                'label' => 'admin.fields.consultation.opinion_types'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.consultation.updated_at'
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.consultation.created_at'
            ]);
    }

    private function createQueryForOpinionTypes()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;

        return $this->getConfigurationPool()
            ->getContainer()
            ->get(OpinionTypeRepository::class)
            ->getOrderedRootNodesQuery($subject);
    }
}
