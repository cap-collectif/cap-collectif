<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Validator\Constraints\Valid;

class OpinionAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    public function getFormBuilder()
    {
        if (isset($this->formOptions['cascade_validation'])) {
            unset($this->formOptions['cascade_validation']);
            $this->formOptions['constraints'][] = new Valid();
        }

        return parent::getFormBuilder();
    }

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $opinionTypeId = null;

        if ($subject && $subject->getOpinionType()) {
            $opinionTypeId = $subject->getOpinionType()->getId();
        } else {
            $opinionTypeId = $this->getRequest()->get('opinion_type_id');
        }

        return [
            'opinion_type' => $opinionTypeId,
        ];
    }

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Opinion:list.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Opinion:edit.html.twig';
        }
        if ('show' === $name) {
            return 'CapcoAdminBundle:Opinion:show.html.twig';
        }
        if ('delete' === $name) {
            return 'CapcoAdminBundle:Opinion:delete.html.twig';
        }

        return parent::getTemplate($name);
    }

    public function getBatchActions()
    {
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('id', null, [
                'label' => 'admin.fields.opinion.id',
            ])
            ->add('title', null, [
                'label' => 'admin.fields.opinion.title',
            ])
            ->add('Author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.opinion.author',
            ], null, [
                'property' => 'username',
            ])
            ->add('step', null, [
                'label' => 'admin.fields.opinion.step',
            ])
            ->add('OpinionType', null, [
                'label' => 'admin.fields.opinion.opinion_type',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.opinion.is_enabled',
            ])
            ->add('pinned', null, [
                'label' => 'admin.fields.opinion.pinned_long',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.opinion.is_trashed',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion.updated_at',
            ])
            ->add('argumentsCount', null, [
                'label' => 'admin.fields.opinion.argument_count',
            ])
            ->add('sourcesCount', null, [
                'label' => 'admin.fields.opinion.source_count',
            ])
            ->add('expired', null, ['label' => 'admin.global.expired'])
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('id', null, [
                'label' => 'admin.fields.opinion.id',
            ])
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.opinion.title',
            ])
            ->add('Author', 'sonata_type_model', [
                'label' => 'admin.fields.opinion.author',
            ])
            ->add('OpinionType', null, [
                'label' => 'admin.fields.opinion.opinion_type',
            ])
            ->add('step', 'sonata_type_model', [
                'label' => 'admin.fields.opinion.step',
            ])
            ->add('voteCountTotal', 'integer', [
                'label' => 'admin.fields.opinion.vote_count_total',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_list_field.html.twig',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.opinion.position',
            ])
            ->add('argumentsCount', null, [
                'label' => 'admin.fields.opinion.argument_count',
            ])
            ->add('sourcesCount', null, [
                'label' => 'admin.fields.opinion.source_count',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.opinion.is_enabled',
            ])
            ->add('pinned', null, [
                'editable' => true,
                'label' => 'admin.fields.opinion.pinned',
            ])
            ->add('isTrashed', null, [
                'editable' => true,
                'label' => 'admin.fields.opinion.is_trashed',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subjectHasAppendices = $this->getSubject()->getAppendices()->count() > 0;
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();

        $classname = $subjectHasAppendices ? '' : 'hidden';
        $formMapper
            ->with('admin.fields.opinion.group_content', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.opinion.group_appendices', ['class' => 'col-md-12 ' . $classname])->end()
            ->with('admin.fields.opinion.group_publication', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.opinion.group_answer', ['class' => 'col-md-12'])->end()
            ->end()
        ;

        $formMapper
            // Content
            ->with('admin.fields.opinion.group_content')
                ->add('title', null, [
                    'label' => 'admin.fields.opinion.title',
                ])
                ->add('Author', 'sonata_type_model_autocomplete', [
                    'label' => 'admin.fields.opinion.author',
                    'property' => 'username',
                ])
                ->add('position', null, [
                    'label' => 'admin.fields.opinion.position',
                    'required' => false,
                ])
                ->add('body', CKEditorType::class, [
                    'label' => 'admin.fields.opinion.body',
                    'config_name' => 'admin_editor',
                ])
                ->add('step', null, [
                    'label' => 'admin.fields.opinion.step',
                    'query_builder' => $this->createQueryBuilderForStep(),
                    'property' => 'labelTitle',
                    'required' => true,
                ])
            ->end()

            // Appendices
            ->with('admin.fields.opinion.group_appendices')
            ->add('appendices', 'sonata_type_collection', [
                'label' => 'admin.fields.opinion.appendices',
                'by_reference' => false,
                'required' => false,
                'btn_add' => false,
                'type_options' => ['delete' => false, 'btn_add' => false],
                'attr' => ['class' => $classname],
            ])
            ->end()

            // Publication
            ->with('admin.fields.opinion.group_publication')
                ->add('isEnabled', null, [
                    'label' => 'admin.fields.opinion.is_enabled',
                    'required' => false,
                ])
                ->add('pinned', null, [
                    'label' => 'admin.fields.opinion.pinned_long',
                    'required' => false,
                ])
                ->add('expired', null, [
                    'label' => 'admin.global.expired',
                    'attr' => [
                      'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                      'readonly' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                    ],
                ])
                ->add('isTrashed', null, [
                    'label' => 'admin.fields.opinion.is_trashed',
                    'required' => false,
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.opinion.trashed_reason',
                ])
            ->end()

            // Answer
            ->with('admin.fields.opinion.group_answer')
            ->add('answer', 'sonata_type_model_list', [
                'label' => 'admin.fields.opinion.answer',
                'btn_list' => false,
                'required' => false,
            ])
            ->end()
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();
        $subjectHasAppendices = $this->getSubject()->getAppendices()->count() > 0;

        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.opinion.title',
            ])
            ->add('Author', null, [
                'label' => 'admin.fields.opinion.author',
            ])
            ->add('OpinionType', null, [
                'label' => 'admin.fields.opinion.opinion_type',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.opinion.body',
            ])
        ;

        if ($subjectHasAppendices) {
            $showMapper
                ->add('appendices', null, [
                    'label' => 'admin.fields.opinion.appendices',
                ])
            ;
        }

        $showMapper
            ->add('step', null, [
                'label' => 'admin.fields.opinion.step',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.opinion.position',
            ])
            ->add('voteCountTotal', null, [
                'label' => 'admin.fields.opinion.vote_count_total',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_show_field.html.twig',
            ])
            ->add('votesCountOk', null, [
                'label' => 'admin.fields.opinion.vote_count_ok',
            ])
            ->add('votesCountNok', null, [
                'label' => 'admin.fields.opinion.vote_count_nok',
            ])
            ->add('votesCountMitige', null, [
                'label' => 'admin.fields.opinion.vote_count_mitige',
            ])
            ->add('argumentsCount', null, [
                'label' => 'admin.fields.opinion.argument_count',
            ])
            ->add('sourcesCount', null, [
                'label' => 'admin.fields.opinion.source_count',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.opinion.is_enabled',
            ])
            ->add('pinned', null, [
                'label' => 'admin.fields.opinion.pinned_long',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.opinion.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion.updated_at',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.opinion.is_trashed',
            ])
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, [
                    'label' => 'admin.fields.opinion.trashed_at',
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.opinion.trashed_reason',
                ])
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'show', 'create', 'edit', 'delete', 'export']);
    }

    private function createQueryBuilderForStep()
    {
        if (!$this->getPersistentParameter('opinion_type')) {
            return;
        }

        $em = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine')
            ->getManager();

        $opinionType = $em
            ->getRepository('CapcoAppBundle:OpinionType')
            ->find($this->getPersistentParameter('opinion_type'));

        if (!$opinionType) {
            throw new \InvalidArgumentException('Invalid opinion type.');
        }

        $consultationStepType = $opinionType->getConsultationStepType();

        return $em
            ->getRepository('CapcoAppBundle:Steps\ConsultationStep')
            ->createQueryBuilder('cs')
            ->join('cs.consultationStepType', 'type')
            ->where('type = :stepType')
            ->setParameter('stepType', $consultationStepType)
        ;
    }
}
