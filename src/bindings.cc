#include <emscripten.h>
#include <rw.h>
#include <rwgta.h>

#define A EMSCRIPTEN_KEEPALIVE

extern "C" {
A void rw_currentUVAnimDictionary_set(rw::UVAnimDictionary *v)
    { rw::currentUVAnimDictionary = v; }
A void rw_platform_set(rw::Platform p) { rw::platform = p; }
A bool rw_readChunkHeaderInfo(rw::Stream *s, rw::ChunkHeaderInfo *h)
    { return rw::readChunkHeaderInfo(s, h); }

A rw::Atomic *rw_Atomic_fromClump(rw::LLLink *lnk) { return rw::Atomic::fromClump(lnk); }
A rw::Frame *rw_Atomic_getFrame(rw::Atomic *self) { return self->getFrame(); }
A rw::Geometry *rw_Atomic_geometry(rw::Atomic *self) { return self->geometry; }

A rw::ChunkHeaderInfo *rw_ChunkHeaderInfo_new() { return new rw::ChunkHeaderInfo(); }
A uint32_t rw_ChunkHeaderInfo_type(rw::ChunkHeaderInfo *self) { return self->type; }
A void rw_ChunkHeaderInfo_delete(rw::ChunkHeaderInfo *self) { delete self; }

A rw::Clump *rw_Clump_streamRead(rw::Stream *s) { return rw::Clump::streamRead(s); }
A rw::LinkList *rw_Clump_atomics(rw::Clump *self) { return &self->atomics; }
A rw::Frame *rw_Clump_getFrame(rw::Clump *self) { return self->getFrame(); }
A void rw_Clump_destroy(rw::Clump *self) { self->destroy(); }

A bool rw_Engine_init() { return rw::Engine::init(); }
A bool rw_Engine_open() { return rw::Engine::open(); }
A bool rw_Engine_start(rw::EngineStartParams *p) { return rw::Engine::start(p); }

A int32_t rw_Geometry_numVertices(rw::Geometry *self) { return self->numVertices; }
A int32_t rw_Geometry_numTexCoordSets(rw::Geometry *self) { return self->numTexCoordSets; }
A rw::RGBA *rw_Geometry_colors(rw::Geometry *self) { return self->colors; }
A rw::MeshHeader *rw_Geometry_meshHeader(rw::Geometry *self) { return self->meshHeader; }
A rw::MorphTarget *rw_Geometry_morphTargets(rw::Geometry *self, int i)
    { return &self->morphTargets[i]; }
A rw::TexCoords *rw_Geometry_texCoords(rw::Geometry *self, int i)
    { return self->texCoords[i]; }

A void rw_Image_unindex(rw::Image *self) { self->unindex(); }
A int32_t rw_Image_bpp(rw::Image *self) { return self->bpp; }
A int32_t rw_Image_depth(rw::Image *self) { return self->depth; }
A uint8_t *rw_Image_pixels(rw::Image *self) { return self->pixels; }
A int32_t rw_Image_width(rw::Image *self) { return self->width; }
A int32_t rw_Image_height(rw::Image *self) { return self->height; }
A bool rw_Image_hasAlpha(rw::Image *self) { return self->hasAlpha(); }
A void rw_Image_destroy(rw::Image *self) { self->destroy(); }

A rw::LLLink *rw_LinkList_end(rw::LinkList *self) { return self->end(); }

A rw::LLLink *rw_LLLink_next(rw::LLLink *self) { return self->next; }

A rw::Texture *rw_Material_texture(rw::Material *self) { return self->texture; }
A rw::RGBA *rw_Material_color(rw::Material *self) { return &self->color; }
A rw::SurfaceProperties *rw_Material_surfaceProps(rw::Material *self)
    { return &self->surfaceProps; }

A uint32_t rw_Mesh_numIndices(rw::Mesh *self) { return self->numIndices; }
A uint16_t *rw_Mesh_indices(rw::Mesh *self) { return self->indices; }
A rw::Material *rw_Mesh_material(rw::Mesh *self) { return self->material; }

A uint16_t rw_MeshHeader_numMeshes(rw::MeshHeader *self) { return self->numMeshes; }
A uint32_t rw_MeshHeader_flags(rw::MeshHeader *self) { return self->flags; }
A rw::Mesh *rw_MeshHeader_getMeshes(rw::MeshHeader *self, int i)
    { return &self->getMeshes()[i]; }

A rw::Geometry *rw_MorphTarget_parent(rw::MorphTarget *self) { return self->parent; }
A rw::V3d *rw_MorphTarget_vertices(rw::MorphTarget *self) { return self->vertices; }
A rw::V3d *rw_MorphTarget_normals(rw::MorphTarget *self) { return self->normals; }

A bool rw_Raster_formatHasAlpha(rw::Raster::Format f)
    { return rw::Raster::formatHasAlpha(f); }
A rw::Image *rw_Raster_toImage(rw::Raster *self) { return self->toImage(); }
A int32_t rw_Raster_format(rw::Raster *self) { return self->format; }

A rw::StreamMemory *rw_StreamMemory_new() { return new rw::StreamMemory(); }
A rw::StreamMemory *rw_StreamMemory_open(rw::StreamMemory *self, uint8_t *data, uint32_t length, uint32_t capacity)
    { return self->open(data, length, capacity); }
A void rw_StreamMemory_close(rw::StreamMemory *self) { self->close(); }
A void rw_StreamMemory_delete(rw::StreamMemory *self) { delete self; }

A float rw_SurfaceProperties_ambient(rw::SurfaceProperties *self) { return self->ambient; }
A float rw_SurfaceProperties_specular(rw::SurfaceProperties *self) { return self->specular; }
A float rw_SurfaceProperties_diffuse(rw::SurfaceProperties *self) { return self->diffuse; }

A rw::TexDictionary *rw_TexDictionary_streamRead(rw::Stream *s)
    { return rw::TexDictionary::streamRead(s); }
A void rw_TexDictionary_setCurrent(rw::TexDictionary *txd)
    { rw::TexDictionary::setCurrent(txd); }
A rw::LinkList *rw_TexDictionary_textures(rw::TexDictionary *self)
    { return &self->textures; }
A void rw_TexDictionary_destroy(rw::TexDictionary *self) { self->destroy(); }

A void rw_Texture_setCreateDummies(bool b) { rw::Texture::setCreateDummies(b); }
A void rw_Texture_setLoadTextures(bool b) { rw::Texture::setLoadTextures(b); }
A rw::Texture *rw_Texture_fromDict(rw::LLLink *lnk) { return rw::Texture::fromDict(lnk); }
A rw::Raster *rw_Texture_raster(rw::Texture *self) { return self->raster; }
A char *rw_Texture_name(rw::Texture *self) { return self->name; }
A rw::Texture::FilterMode rw_Texture_getFilter(rw::Texture *self)
    { return self->getFilter(); }
A rw::Texture::Addressing rw_Texture_getAddressU(rw::Texture *self)
    { return self->getAddressU(); }
A rw::Texture::Addressing rw_Texture_getAddressV(rw::Texture *self)
    { return self->getAddressV(); }

A rw::UVAnimDictionary *rw_UVAnimDictionary_streamRead(rw::Stream *s)
    { return rw::UVAnimDictionary::streamRead(s); }

A void gta_attachPlugins() { gta::attachPlugins(); }
A char *gta_getNodeName(rw::Frame *f) { return gta::getNodeName(f); }
}
