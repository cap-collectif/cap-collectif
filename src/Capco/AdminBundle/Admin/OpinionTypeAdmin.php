<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Steps\ConsultationStepType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Opinion;

class OpinionTypeAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $consultationStepTypeId = null;
        $consultationStepTypeName = null;

        if ($this->hasParentFieldDescription() && $this->getParentFieldDescription()->getAdmin()->getSubject()) {
            $consultationStepTypeId = $this->getParentFieldDescription()->getAdmin()->getSubject()->getId();
        } elseif ($subject && $subject->getConsultationStepType()) {
            $consultationStepTypeId = $subject->getConsultationStepType()->getId();
        } elseif ($subject && $subject->getRoot()) {
            $root = $this
                ->getConfigurationPool()
                ->getContainer()
                ->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:OpinionType')
                ->find($subject->getRoot())
            ;
            if ($root) {
                $cst = $root->getConsultationStepType();
                $consultationStepTypeId = $cst ? $cst->getId() : null;
            }
        }

        if ($consultationStepTypeId === null) {
            $consultationStepTypeId = $this->getRequest()->get('consultation_step_type_id');
        }

        $consultationStepTypeName = $this->getRequest()->get('consultation_step_type_name');

        return [
            'consultation_step_type_id' => $consultationStepTypeId,
            'consultation_step_type_name' => $consultationStepTypeName,
        ];
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.opinion_type.group_info', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.opinion_type.group_options', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.opinion_type.group_votes', ['class' => 'col-md-6'])->end()
            ->with('admin.fields.opinion_type.group_contribution', ['class' => 'col-md-6'])->end()
            ->with('admin.fields.opinion_type.group_appendices', ['class' => 'col-md-12'])->end()
            ->end()
        ;

        $formMapper
            // Info
            ->with('admin.fields.opinion_type.group_info')
            ->add('title', null, [
                'label' => 'admin.fields.opinion_type.title',
            ])
            ->add('subtitle', null, [
                'label' => 'admin.fields.opinion_type.subtitle',
            ])
            ->add('parent', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_type.parent',
                'required' => false,
                'query' => $this->createQueryForParent(),
                'btn_add' => false,
            ])
            ->add('position', null, [
                'label' => 'admin.fields.opinion_type.position',
            ])
            ->end()

            // Options
            ->with('admin.fields.opinion_type.group_options')
            ->add('color', 'choice', [
                'label' => 'admin.fields.opinion_type.color',
                'choices' => OpinionType::$colorsType,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('defaultFilter', 'choice', [
                'label' => 'admin.fields.opinion_type.default_filter',
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->end()

            ->with('admin.fields.opinion_type.group_votes')
            ->add('voteWidgetType', 'choice', [
                'label' => 'admin.fields.opinion_type.vote_widget_type',
                'choices' => OpinionType::$voteWidgetLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->add('votesHelpText', 'textarea', [
                'label' => 'admin.fields.opinion_type.votes_help_text',
                'required' => false,
            ])
            ->add('votesThreshold', 'integer', [
                'label' => 'admin.fields.opinion_type.votes_threshold',
                'required' => false,
            ])
            ->add('votesThresholdHelpText', 'textarea', [
                'label' => 'admin.fields.opinion_type.votes_threshold_help_text',
                'required' => false,
            ])
            ->end()

            ->with('admin.fields.opinion_type.group_contribution')
            ->add('isEnabled', null, [
                'label' => 'admin.fields.opinion_type.is_enabled',
                'required' => false,
            ])
            ->add('versionable', null, [
                'label' => 'admin.fields.opinion_type.versionable',
                'required' => false,
            ])
            ->add('linkable', null, [
                'label' => 'admin.fields.opinion_type.linkable',
                'required' => false,
            ])
            ->add('sourceable', null, [
                'label' => 'admin.fields.opinion_type.sourceable',
                'required' => false,
            ])
            ->add('commentSystem', 'choice', [
                'label' => 'admin.fields.opinion_type.comment_system',
                'choices' => OpinionType::$commentSystemLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->end()

            // Appendices
            ->with('admin.fields.opinion_type.group_appendices')
            ->add('appendixTypes', 'sonata_type_collection', [
                'label' => 'admin.fields.opinion_type.appendices',
                'by_reference' => false,
                'required' => false,
            ], [
                'edit' => 'inline',
                'inline' => 'table',
                'sortable' => 'position',
            ])
            ->end()
        ;
    }

    private function createQueryForParent()
    {
        $consultationStepTypeId = $this->getPersistentParameter('consultation_step_type_id');

        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionType')
            ->createQueryBuilder('ot')
            ->where('ot.root IN (
                SELECT ot2.id
                FROM CapcoAppBundle:OpinionType ot2
                LEFT JOIN ot2.consultationStepType ct
                WHERE ot2.parent IS NULL
                AND ct.id = ?0
            )')
            ->setParameter(0, $consultationStepTypeId)
        ;

        if ($this->getSubject()->getId()) {
            $qb
                ->andWhere('ot.id != ?1')
                ->setParameter(1, $this->getSubject()->getId())
            ;
        }

        return $qb->getQuery();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    public function getTemplate($name)
    {
        if ($name === 'edit' || $name === 'create') {
            return 'CapcoAdminBundle:OpinionType:edit.html.twig';
        }

        return parent::getTemplate($name); // TODO: Change the autogenerated stub
    }

    public function prePersist($type)
    {
        if (!$type->getConsultationStepType()) {
            $consultationStepTypeId = $this->getPersistentParameter('consultation_step_type_id');
            if ($consultationStepTypeId !== null) {
                $consultationStepType = $this->getConfigurationPool()
                    ->getContainer()
                    ->get('doctrine.orm.entity_manager')
                    ->getRepository('CapcoAppBundle:Steps\ConsultationStepType')
                    ->find($consultationStepTypeId);
                $type->setConsultationStepType($consultationStepType);
            }
        }
    }

    public function postPersist($object)
    {
        $this->verifyTree();
    }

    public function postUpdate($object)
    {
        $this->verifyTree($object);
    }

    public function postRemove($object)
    {
        $this->verifyTree($object);
    }

    public function verifyTree($object)
    {
        $em = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
        ;
        $repo = $em
            ->getRepository('CapcoAppBundle:OpinionType')
        ;
        $repo->verify();
        $repo->recover();
        if ($object && $object->getParent()) {
            $repo->reorder($object->getParent(), 'position');
        }

        $em->flush();
    }
}
