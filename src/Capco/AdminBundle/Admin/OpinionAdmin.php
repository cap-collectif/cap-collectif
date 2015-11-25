<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class OpinionAdmin extends Admin
{
    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $opinionTypeId = null;

        if ($subject && $subject->getOpinionType()) {
            $opinionTypeId = $subject->getOpinionType()->getId();
        } else {
            $opinionTypeId = $this->getRequest()->get('opinion_type_id');
        }

        return array(
            'opinion_type' => $opinionTypeId,
        );
    }

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.opinion.title',
            ))
            ->add('Author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.opinion.author',
            ], null, array(
                'property' => 'username',
            ))
            ->add('step', null, array(
                'label' => 'admin.fields.opinion.step',
            ))
            ->add('OpinionType', null, array(
                'label' => 'admin.fields.opinion.opinion_type',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion.is_enabled',
            ))
            ->add('pinned', null, array(
                'label' => 'admin.fields.opinion.pinned_long',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion.is_trashed',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion.updated_at',
            ))
            ->add('argumentsCount', null, array(
                'label' => 'admin.fields.opinion.argument_count',
            ))
            ->add('sourcesCount', null, array(
                'label' => 'admin.fields.opinion.source_count',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.opinion.title',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion.author',
            ))
            ->add('OpinionType', null, array(
                'label' => 'admin.fields.opinion.opinion_type',
            ))
            ->add('step', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion.step',
            ))
            ->add('voteCountTotal', 'integer', array(
                'label' => 'admin.fields.opinion.vote_count_total',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_list_field.html.twig',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.opinion.position',
            ))
            ->add('argumentsCount', null, array(
                'label' => 'admin.fields.opinion.argument_count',
            ))
            ->add('sourcesCount', null, array(
                'label' => 'admin.fields.opinion.source_count',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.opinion.is_enabled',
            ))
            ->add('pinned', null, array(
                'editable' => true,
                'label' => 'admin.fields.opinion.pinned',
            ))
            ->add('isTrashed', null, array(
                'editable' => true,
                'label' => 'admin.fields.opinion.is_trashed',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subjectHasAppendices = $this->getSubject()->getAppendices()->count() > 0 ? true : false;
        $classname = $subjectHasAppendices ? '' : 'hidden';
        $formMapper
            ->with('admin.fields.opinion.group_content', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.opinion.group_appendices', array('class' => 'col-md-12 '.$classname))->end()
            ->with('admin.fields.opinion.group_publication', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.opinion.group_answer', array('class' => 'col-md-12'))->end()
            ->end()
        ;

        $formMapper
            // Content
            ->with('admin.fields.opinion.group_content')
                ->add('title', null, array(
                    'label' => 'admin.fields.opinion.title',
                ))
                ->add('Author', 'sonata_type_model_autocomplete', [
                    'label' => 'admin.fields.opinion.author',
                    'property' => 'username',
                ])
                ->add('position', null, array(
                    'label' => 'admin.fields.opinion.position',
                ))
                ->add('body', 'ckeditor', array(
                    'label' => 'admin.fields.opinion.body',
                    'config_name' => 'admin_editor',
                ))
                ->add('step', null, array(
                    'label' => 'admin.fields.opinion.step',
                    'query_builder' => $this->createQueryBuilderForStep(),
                    'required' => true,
                ))
            ->end()

            // Appendices
            ->with('admin.fields.opinion.group_appendices')
            ->add('appendices', 'sonata_type_collection', array(
                'label' => 'admin.fields.opinion.appendices',
                'by_reference' => false,
                'required' => false,
                'btn_add' => false,
                'type_options' => ['delete' => false, 'btn_add' => false],
                'attr' => ['class' => $classname],
            ))
            ->end()

            // Publication
            ->with('admin.fields.opinion.group_publication')
                ->add('isEnabled', null, array(
                    'label' => 'admin.fields.opinion.is_enabled',
                    'required' => false,
                ))
                ->add('pinned', null, array(
                    'label' => 'admin.fields.opinion.pinned_long',
                    'required' => false,
                ))
                ->add('isTrashed', null, array(
                    'label' => 'admin.fields.opinion.is_trashed',
                    'required' => false,
                ))
                ->add('trashedReason', null, array(
                    'label' => 'admin.fields.opinion.trashed_reason',
                ))
            ->end()

            // Answer
            ->with('admin.fields.opinion.group_answer')
            ->add('answer', 'sonata_type_model_list', array(
                'label' => 'admin.fields.opinion.answer',
                'btn_list' => false,
                'required' => false,
            ))
            ->end()
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();
        $subjectHasAppendices = $this->getSubject()->getAppendices()->count() > 0 ? true : false;

        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.opinion.title',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.opinion.author',
            ))
            ->add('OpinionType', null, array(
                'label' => 'admin.fields.opinion.opinion_type',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.opinion.body',
            ))
        ;

        if ($subjectHasAppendices) {
            $showMapper
                ->add('appendices', null, array(
                    'label' => 'admin.fields.opinion.appendices',
                ))
            ;
        }

        $showMapper
            ->add('step', null, array(
                'label' => 'admin.fields.opinion.step',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.opinion.position',
            ))
            ->add('voteCountTotal', null, array(
                'label' => 'admin.fields.opinion.vote_count_total',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_show_field.html.twig',
            ))
            ->add('votesCountOk', null, array(
                'label' => 'admin.fields.opinion.vote_count_ok',
            ))
            ->add('votesCountNok', null, array(
                'label' => 'admin.fields.opinion.vote_count_nok',
            ))
            ->add('votesCountMitige', null, array(
                'label' => 'admin.fields.opinion.vote_count_mitige',
            ))
            ->add('argumentsCount', null, array(
                'label' => 'admin.fields.opinion.argument_count',
            ))
            ->add('sourcesCount', null, array(
                'label' => 'admin.fields.opinion.source_count',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion.is_enabled',
            ))
            ->add('pinned', null, array(
                'label' => 'admin.fields.opinion.pinned_long',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion.updated_at',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion.is_trashed',
            ))
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, array(
                    'label' => 'admin.fields.opinion.trashed_at',
                ))
                ->add('trashedReason', null, array(
                    'label' => 'admin.fields.opinion.trashed_reason',
                ))
            ;
        }
    }

    private function createQueryBuilderForStep()
    {
        $opinionTypeId = $this->getPersistentParameter('opinion_type');

        if (!$opinionTypeId) {
            return null;
        }

        $root = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionType')
            ->createQueryBuilder('ot')
            ->where('ot.id IN (SELECT ot2.root FROM CapcoAppBundle:OpinionType ot2 WHERE ot2.id = ?0)')
            ->setParameter(0, $opinionTypeId)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$root) {
            throw new \Exception('Invalid opinion type.');
        }

        $consultationStepType = $root->getConsultationStepType();

        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Steps\ConsultationStep')
            ->createQueryBuilder('cs')
            ->where('cs.consultationStepType = ?0')
            ->setParameter(0, $consultationStepType)
        ;

        return $qb;
    }

    public function getTemplate($name)
    {
        if ($name == 'list') {
            return 'CapcoAdminBundle:Opinion:list.html.twig';
        }
        if ($name == 'edit') {
            return 'CapcoAdminBundle:Opinion:edit.html.twig';
        }
        if ($name == 'show') {
            return 'CapcoAdminBundle:Opinion:show.html.twig';
        }
        if ($name == 'delete') {
            return 'CapcoAdminBundle:Opinion:delete.html.twig';
        }

        return parent::getTemplate($name);
    }

    public function prePersist($opinion)
    {
        if (!$opinion->getOpinionType()) {
            $opinionType = $this->getConfigurationPool()
                ->getContainer()
                ->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:OpinionType')
                ->find($this->getPersistentParameters('opinion_type'));
            $opinion->setOpinionType($opinionType);
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('list', 'show', 'create', 'edit', 'delete', 'export'));
    }

    public function getBatchActions()
    {
        return;
    }
}
