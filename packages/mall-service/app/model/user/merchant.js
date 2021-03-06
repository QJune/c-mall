'use strict'
const { v1: uuidv1 } = require('uuid')

module.exports = (app) => {
    const { Sequelize, model, getSortInfo, checkUpdate } = app
    const { Op } = Sequelize
    const userSchema = require('../../schema/merchant.js')(app)

    const Merchant = model.define('merchant', userSchema)
    /**
     * @description 新增商家
     * @param {object} merchant - 条件
     * @return {string} - 商家uuid
     */
    Merchant.saveNew = async (merchant) => {
        const uuid = uuidv1() // 这里单独引入是为了默认保持uuid和orgUuid的统一
        merchant.uuid = uuid
        merchant.orgUuid = uuid
        const result = await Merchant.create(merchant)
        return result.uuid
    }

    /**
     * @description 修改商家
     * @param {object} merchant - 条件
     * @return {string} - 商家uuid
     */
    Merchant.saveModify = async (merchant) => {
        const {
            uuid,
            name,
            enableStatus,
            servicePhone,
            linkPhone,
            appId,
            appSecret,
            mchId,
            mchKey,
            linkMan,
            address,
            version,
            password,
            lastModifierId,
            lastModifierName
        } = merchant
        const updateField = {
            version,
            name,
            enableStatus,
            servicePhone,
            appId,
            appSecret,
            mchId,
            mchKey,
            linkPhone,
            linkMan,
            address,
            lastModifierId,
            lastModifierName
        }

        if (password) {
            updateField.password = password
        }

        const result = await Merchant.update(updateField, {
            where: { uuid, version }
        })

        checkUpdate(result)

        return uuid
    }

    /**
     * @description 修改商家密码
     * @param {object} params - 条件
     * @return {string} - 商家uuid
     */
    Merchant.savePasswordModify = async (params) => {
        const {
            uuid,
            oldPassword,
            password,
            lastModifierId,
            lastModifierName
        } = params
        const result = await Merchant.update(
            { password, lastModifierId, lastModifierName },
            {
                where: {
                    uuid,
                    password: oldPassword
                }
            }
        )

        checkUpdate(result, '旧密码不正确')

        return uuid
    }

    /**
     * 查询商家分页列表
     * @param {object} { attributes, pagination, filter } - 条件
     * @return {object|null} - 查找结果
     */
    Merchant.query = async ({
        attributes,
        pagination = {},
        filter = {},
        sort = []
    }) => {
        const { page, pageSize: limit } = pagination
        const { keywordsLike, status } = filter
        const order = getSortInfo(sort)
        const condition = {
            offset: (page - 1) * limit,
            limit,
            order,
            attributes,
            where: {}
        }

        if (status) {
            condition.where.enableStatus = status
        }

        if (keywordsLike) {
            condition.where[Op.or] = [
                { userName: { [Op.like]: `%%${keywordsLike}%%` } },
                { name: { [Op.like]: `%%${keywordsLike}%%` } },
                { linkMan: { [Op.like]: `%%${keywordsLike}%%` } },
                { linkPhone: { [Op.like]: `%%${keywordsLike}%%` } },
                { servicePhone: { [Op.like]: `%%${keywordsLike}%%` } }
            ]
        }

        const { count, rows: list } = await Merchant.findAndCountAll(condition)

        return { page, count, list }
    }

    /**
     * @description 根据uuid获取用户
     * @param {object} { pagination, filter } - 条件
     * @return {object|null} - 查找结果
     */
    Merchant.get = async ({ uuid, attributes }) => {
        return await Merchant.findByPk(uuid, {
            attributes
        })
    }
    return Merchant
}
